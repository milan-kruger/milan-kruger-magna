import {
  OverloadTransgression,
  TransgressionDto,
  useCancelTransgressionMutation,
} from "../../redux/api/transgressionsApi";

const useCancelTransgressionManager = (
  transgression: TransgressionDto
) => {

  const [cancelTransgression, {isLoading}] = useCancelTransgressionMutation();

  const onCancelTransgression = (
    cancellationReasons: string[],
    supervisorUsername: string,
    supervisorPassword: string,
    newPlateNumber?: string
  ): Promise<boolean> => {

    return new Promise((resolve) => {
      const overloadTransgression: OverloadTransgression = JSON.parse(JSON.stringify(transgression));
      cancelTransgression({
        cancelTransgressionRequest: {
          reasons: cancellationReasons,
          supervisorUsername: supervisorUsername,
          supervisorPassword: btoa(supervisorPassword),
          newPlateNumber: newPlateNumber,
          noticeNumber: overloadTransgression.noticeNumber.number,
          sequenceNumber: overloadTransgression.sequenceNumber!,
          authorityCode: overloadTransgression.authorityCode,
        },
      }).unwrap().then((value) => {
          if (value.cancelled) {
            resolve(true);
          } else if (!value.cancelled) {
            resolve(false);
          }
      });
    });
  };

  return [onCancelTransgression, isLoading] as const;
};

export default useCancelTransgressionManager;
