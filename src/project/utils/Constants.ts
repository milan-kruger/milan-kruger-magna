import { JsonObjectType } from "../enum/JsonObjectType";
import { SnapshotLoadCharge, SnapshotLoadChargeDto, SnapshotRtqsCharge, SnapshotRtqsChargeDto, SnapshotSpeedCharge, SnapshotSpeedChargeDto } from "../redux/api/transgressionsApi";

const Constants = {
    plateNumberMaxLength: 9,
    dtoToObj: (dto: SnapshotLoadChargeDto | SnapshotRtqsChargeDto | SnapshotSpeedChargeDto)
        : SnapshotLoadCharge | SnapshotRtqsCharge | SnapshotSpeedCharge | undefined => {
        if (dto.type === JsonObjectType.SnapshotLoadChargeDto) {
            return { ...dto, type: JsonObjectType.SnapshotLoadCharge } as SnapshotLoadCharge;
        } else if (dto.type === JsonObjectType.SnapshotRtqsChargeDto) {
            return { ...dto, type: JsonObjectType.SnapshotRtqsCharge } as SnapshotRtqsCharge;
        } else if (dto.type === JsonObjectType.SnapshotSpeedChargeDto) {
            return { ...dto, type: JsonObjectType.SnapshotSpeedCharge } as SnapshotSpeedCharge;
        }
        return undefined;
    },
    emailRegex: RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i)
}

export default Constants;
