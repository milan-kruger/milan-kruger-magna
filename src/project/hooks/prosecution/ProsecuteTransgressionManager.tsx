import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRemovePendingProsecutionMutation, useRetrieveOverloadTransgressionInformationMutation } from '../../redux/api/transgressionsApi';
import { ROUTE_NAMES } from '../../Routing';

const useProsecuteTransgressionMananger = () => {
  const [retrieveTransgressionRequest] = useRetrieveOverloadTransgressionInformationMutation();
  const [removePendingProsecution] = useRemovePendingProsecutionMutation();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { sequenceNumber } = useParams();

  useEffect(() => {
    setIsLoading(true);
    if (sequenceNumber && sequenceNumber !== '') {
      const sequenceNumberInt = parseInt(sequenceNumber);
      retrieveTransgressionRequest({
        retrieveTransgressionInformationRequest: {
          sequenceNumber: sequenceNumberInt
        },
      }).unwrap()
        .then((response) => {
          setIsLoading(false);
          if (response && !response.arrestCase) {
            navigate(`/prosecuteTransgression/captureTransgression/${sequenceNumberInt}`, {
              replace: true,
              state: {
                transgressionDetails: {
                  ...response,
                  transgressionStatus: 'Unknown',
                },
                newTransgression: true,
                from: ROUTE_NAMES.prosecuteTransgressionRoute,
              },
            });
          } else if (response && response.arrestCase) {
            navigate(`/${ROUTE_NAMES.captureCorrectionReason}`, {
              state: {
                transgressionDetails: { ...response },
                sequenceNumber: sequenceNumberInt,
              },
              replace: true,
            });
          }
        })
        .catch(() => {
          removePendingProsecution({ sequenceNumber: sequenceNumberInt });
          setIsLoading(false);
        });
    }
    else {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequenceNumber, retrieveTransgressionRequest, navigate]);

  return {
    isLoading
  };
};

export default useProsecuteTransgressionMananger;
