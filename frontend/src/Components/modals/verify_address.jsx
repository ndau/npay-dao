import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { axiosRequest } from '../../api/api';

function VerifyAddressModal(props) {
  const { hideShowModalHandler, showModal, vote } = props;
  const [ballot, setBallot] = useState({});
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if(vote.ballot){
      setBallot(JSON.parse(vote.ballot));
    }

    return () => {
      setBallot({});
      setWalletAddress('');
    }
  }, [vote, showModal]);

  const verifyHandler = async() => {
    try{
      const payload = {
        signature: vote?.signature,
        message: ballot?.message,
        version: ballot?.version
      }

      const { data } = await axiosRequest(
        'post',
        'vote/verify',
        payload
      );

      if(!data.status){
        return toast.error(data.message);
      }

      setWalletAddress(data.address);
      
    }catch(err){
      toast.error("Something went wrong!");
    }
  }

  return (
    <>
      <Modal show={showModal} onHide={hideShowModalHandler} animation={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>V4 Type Signature Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label> Signature: </Form.Label>
            <Form.Control type='text' value={vote?.signature} readOnly />
          </Form.Group>

          <Form.Group style={{ marginTop: '10px' }}>
            <Form.Label> Message: </Form.Label>
            <Form.Control as='textarea' value={JSON.stringify(ballot?.message, null, 4)} readOnly rows={13} />
          </Form.Group>

          <Form.Group style={{ marginTop: '10px' }}>
            <Form.Label> Version: </Form.Label>
            <Form.Control type='text' value={ballot?.version} readOnly />
          </Form.Group>

          {
            walletAddress && (
              <p style={{ marginTop: '20px', marginBottom: '0px' }}>
                <span style={{ color: 'rgb(246, 147, 29)', fontWeight: 'bold' }}>Signed address is:</span> {walletAddress}
              </p>
            )
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideShowModalHandler}>
            Close
          </Button>
          <Button variant="success" onClick={verifyHandler}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default VerifyAddressModal;