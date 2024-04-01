import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import yaml from 'yaml';
import CopyToClipboard from 'react-copy-to-clipboard';
import { axiosRequest } from '../../api/api';
import { AxiosError } from 'axios';
import { getAccount } from '../../helpers/fetch';
import { useDebouncedCallback } from 'use-debounce';

import { socketBase } from '../../types/socketTypes';
import useNdauConnectStore from '../../store/ndauConnect_store';
import useMetamask from '../../contexts/metamask/use_metamask';
import ButtonSpinner from '../spinners/btn_spinner';

type VoteButtonPropsI = {
  dynamicClassName?: string;
  allowVote?: boolean;
  selectedVoteOption: {
    proposal_id: number;
    proposal_heading: string;
    voting_option_id: number;
    voting_option_heading: string;
  };
};

interface FormInputsI {
  payload: string;
  signature: string;
  wallet_address: string;
  connectedWallet?: string;
}

const schema = yup.object({
  wallet_address: yup.string().required('Wallet address is required'),
  payload: yup.string(),
  signature: yup.string().required('Signature is required'),
});

const asyncFetchPublicKey = async (address: string) => {
  const account = await getAccount(address);
  if (account === null) {
    return null; // Address not valid
  } else {
    const details = account[address];
    if (!details) {
      return 'blank'; // Wallet is blank
    }

    if (!details.validationKeys || details.validationKeys.length === 0) {
      return 'empty';
    }

    return details.validationKeys[0]; // Wallet may has no any validation keys
  }
};

const VoteButton = ({ dynamicClassName, allowVote, selectedVoteOption }: VoteButtonPropsI) => {
  const {
    proposal_id,
    proposal_heading,
    voting_option_id: selectedVoteOptionId,
    voting_option_heading,
  } = selectedVoteOption;

  const connectedWallet = useNdauConnectStore((state) => state.walletAddress);
  const socket = useNdauConnectStore((state) => state.socket);
  const [voteOffline, setVoteOffline] = useState(false);
  const [pubkey, setPubkey] = useState<any>();
  const [payload, setPayload] = useState<string>('');
  const { signInUser, metamaskWeb3 } = useMetamask();  

  const handleAddressChange = useDebouncedCallback(
    async (value) => {
      const validationKey = await asyncFetchPublicKey(value);
      setPubkey(validationKey);
      console.log('validationKey.....', validationKey);
      if (validationKey !== null && validationKey !== 'blank' && validationKey !== 'empty') {
        const payload = {
          vote: 'yes',
          proposal: {
            proposal_id,
            proposal_heading,
            voting_option_id: selectedVoteOptionId,
            voting_option_heading,
          },
          wallet_address: value,
          validation_key: validationKey,
        };

        setPayload(btoa(yaml.stringify(payload)));
      }
    },
    500,
    { maxWait: 2000 }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputsI>({ resolver: yupResolver(schema) });

  // const submitVote = (
  //   _socket: socketBase | null,
  //   _selectedVoteOptionId: number | undefined,
  //   _walletAddress: string,
  //   useWallet?: boolean
  // ) => {
  //   if (!_selectedVoteOptionId) {
  //     toast.warning('Please select a vote option');
  //   } else {
  //     if (useWallet) {
  //       if (_socket) {
  //         _socket.emit('website-create_vote-request-server', {
  //           websiteSocketId: _socket.id,
  //           selectedVoteOptionId: _selectedVoteOptionId,
  //           walletAddress: _walletAddress,
  //         });

  //         try {
  //           toast.info('Awaiting Vote Confirmation');
  //         } catch {
  //           toast.error("Something went wrong. Couldn't vote");
  //         }
  //       } else {
  //         toast.warning('Wallet Not Connected');
  //       }
  //     } else {
  //       // Show offline vote
  //       setVoteOffline(!voteOffline);
  //     }
  //   }
  // };

  const [isVoting, setIsVoting] = useState<boolean>(false);

  const submitVote = async () => {
    setIsVoting(true);
    
    const signatureObj : any = await signInUser();
    if(!signatureObj){
      setIsVoting(false);
      return false;
    } 

    const { signature, welcomeMessage } = signatureObj;
    
    let _payload : any = {
      vote: 'yes',
      proposal: {
        proposal_id,
        proposal_heading,
        voting_option_id: selectedVoteOptionId,
        voting_option_heading,
      },
      wallet_address: metamaskWeb3.walletAddress,
      message: welcomeMessage
    };

    _payload = btoa(yaml.stringify(_payload));

    try {
      const resp = await axiosRequest('post', 'vote', {
        payload: _payload,
        signature
      });

      toast.success(resp.data.message);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message);
      } else {
        console.log('Unexpected error', err);
      }
    }
    setIsVoting(false);
  };

  const onCopy = () => {
    toast.info('Sign Payload Coppied');
  };

  return (
    <>
      <div>
        {!voteOffline && (
          <Button
            disabled={!allowVote}
            onClick={submitVote}
            className={dynamicClassName}
            variant="success"
          >
            { isVoting ? <ButtonSpinner  variant="white" /> : "Add Vote" }
          </Button>
        )}{' '}
        {/* 
          <Button
            disabled={!!connectedWallet || !allowVote}
            onClick={() => submitVote(socket, selectedVoteOptionId, connectedWallet, false)}
            variant="primary"
          >
            {!voteOffline ? 'Sign Manually' : 'Hide'}
          </Button>
         */}
      </div>
      {/* {voteOffline && (
        <form onSubmit={handleSubmit(signManually)}>
          <Card
            style={{
              background: '#1A3356',
              color: '#fff',
              padding: 5,
            }}
          >
            <Card.Body>
              <Row>
                <Form.Control
                  style={{
                    background: '#0F2748',
                    borderColor: '#70707059',
                  }}
                  size="sm"
                  placeholder="Paste your ndau wallet address"
                  {...register('wallet_address')}
                  isInvalid={!!errors}
                  onChange={(e) => handleAddressChange(e.target.value)}
                />
                {(pubkey === null || pubkey === 'blank' || pubkey === 'empty') && (
                  <Form.Control.Feedback type="invalid">
                    {pubkey === null
                      ? 'Wallet address is INVALID'
                      : pubkey === 'blank'
                      ? 'This address has no validation keys'
                      : 'Cannot find a validation key'}
                  </Form.Control.Feedback>
                )}
              </Row>
              <Row>
                <CopyToClipboard text={payload} onCopy={onCopy}>
                  <Form.Control
                    style={{
                      background: '#0F2748',
                      borderColor: '#70707059',
                    }}
                    as="textarea"
                    size="sm"
                    value={payload}
                    rows={4}
                    placeholder="Your Sign Payload (Base64 Encoded). Click to copy to clipboard"
                    readOnly
                  />
                </CopyToClipboard>
              </Row>
              <Row>
                <Form.Control
                  style={{
                    background: '#0F2748',
                    borderColor: '#70707059',
                  }}
                  size="sm"
                  placeholder="Paste Signature"
                  {...register('signature')}
                  isInvalid={!!errors}
                />
              </Row>

              <Row>
                <Button
                  style={{ marginTop: 6 }}
                  disabled={!!connectedWallet || pubkey === null || pubkey === 'blank' || pubkey === 'empty'}
                  type="submit"
                  variant="primary"
                >
                  Vote
                </Button>
              </Row>
            </Card.Body>
          </Card>
        </form>
      )} */}
    </>
  );
};

export default VoteButton;
