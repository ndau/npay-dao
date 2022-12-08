import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CopyToClipboard from 'react-copy-to-clipboard';
import { axiosRequest } from '../../api/api';
import { AxiosError } from 'axios';

import { socketBase } from '../../types/socketTypes';
import useNdauConnectStore from '../../store/ndauConnect_store';

type VoteButtonPropsI = {
  dynamicClassName?: string;
  selectedVoteOption: {
    proposal_id: number;
    proposal_heading: string;
    voting_option_id: number;
    voting_option_heading: string;
  };
};
const helperTextClass = {
  fontSize: 14,
  color: 'grey',
  margin: 0,
};

interface FormInputsI {
  pubkey: string;
  payload: string;
  signature: string;
  walletAddress?: string;
}

const schema = yup.object({
  pubkey: yup.string().required('Heading is required'),
  payload: yup.string(),
  signature: yup.string().required('Voting period is required'),
});

const VoteButton = ({ dynamicClassName, selectedVoteOption }: VoteButtonPropsI) => {
  const {
    proposal_id,
    proposal_heading,
    voting_option_id: selectedVoteOptionId,
    voting_option_heading,
  } = selectedVoteOption;

  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const socket = useNdauConnectStore((state) => state.socket);
  const [voteOffline, setVoteOffline] = useState(false);
  const [pubkey, setPubkey] = useState('');
  const [payload, setPayload] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputsI>({ resolver: yupResolver(schema) });

  const submitVote = (
    _socket: socketBase | null,
    _selectedVoteOptionId: number | undefined,
    _walletAddress: string,
    useWallet?: boolean
  ) => {
    if (!_selectedVoteOptionId) {
      toast.warning('Please select a vote option');
    } else {
      if (useWallet) {
        if (_socket) {
          _socket.emit('website-create_vote-request-server', {
            websiteSocketId: _socket.id,
            selectedVoteOptionId: _selectedVoteOptionId,
            walletAddress: _walletAddress,
          });

          try {
            toast.info('Awaiting Vote Confirmation');
          } catch {
            toast.error("Something went wrong. Couldn't vote");
          }
        } else {
          toast.warning('Wallet Not Connected');
        }
      } else {
        // Show offline vote
        setVoteOffline(!voteOffline);
      }
    }
  };

  const handlePubkeyChange = (e: any) => {
    const pubkey = e.target.value;
    setPubkey(pubkey);

    const payload = {
      vote: 'yes',
      proposal: {
        proposal_id,
        proposal_heading,
        voting_option_id: selectedVoteOptionId,
        voting_option_heading,
      },
      pubkey,
    };

    setPayload(btoa(JSON.stringify(payload)));
  };

  const signManually = async ({ pubkey, signature }: FormInputsI) => {
    console.log('pubkey, payload, signature', pubkey, payload, signature);
    try {
      const resp = await axiosRequest('post', 'vote', {
        pubkey: 'npuba4jaftckeeb4wuqt578x5duj8zp4s3e9w2ngx89shf9gmrhk78k453ibing573sg36a3iaaaaaaujp29k993teer7ygkk2x2x5akwghv2m23yikxxghgujezsck5muascnn6rn6e',
        payload: btoa(
          '{"vote":"yes","proposal":{"proposal_id":1,"proposal_heading":"Demo Proposal","voting_option_id":1,"voting_option_heading":"Test Vote Option 1"},"pubkey":"npuba4jaftckeeb4wuqt578x5duj8zp4s3e9w2ngx89shf9gmrhk78k453ibing573sg36a3iaaaaaaujp29k993teer7ygkk2x2x5akwghv2m23yikxxghgujezsck5muascnn6rn6e"}'
        ),
        signature: 'aujaftchgbcseiia6c8cvercf5zi3zmz7bpid6nf3qi799348z9hma5c8rm427ahg6tseicqd65y62c5wtaze9ic5sm5hk7z9gjue3kcrgzj6tt2jrycunbdicikdx46',
      });

      toast.success(resp.data.message);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message);
      } else {
        console.log('Unexpected error', err);
      }
    }
  };

  const onCopy = () => {
    toast.info('Sign Payload Coppied');
  };
  return (
    <>
      <div>
        {!voteOffline && (
          <Button
            onClick={() => submitVote(socket, selectedVoteOptionId, walletAddress, true)}
            className={dynamicClassName}
            variant="success"
          >
            Add Vote
          </Button>
        )}{' '}
        <Button
          disabled={!!walletAddress}
          onClick={() => submitVote(socket, selectedVoteOptionId, walletAddress, false)}
          variant="primary"
        >
          {!voteOffline ? 'Sign Manually' : 'Hide'}
        </Button>
      </div>
      {voteOffline && (
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
                  placeholder="Paste your Account Address Public Key. Ex: npuba4jaf..."
                  {...register('pubkey')}
                  isInvalid={!!errors}
                  onChange={handlePubkeyChange}
                />
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
                    placeholder="Your Sign Payload (Base64 Encoded)"
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
                <Button style={{ marginTop: 6 }} disabled={!!walletAddress} type="submit" variant="primary">
                  Vote
                </Button>
              </Row>
            </Card.Body>
          </Card>
        </form>
      )}
    </>
  );
};

export default VoteButton;
