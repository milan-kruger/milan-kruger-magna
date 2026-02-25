import dayjs from "dayjs";
import { Court, CourtCaseEntry, CourtResult, CourtResultSummary, Money, NoticeNumber, OverloadTransgression, RtqsTransgression, TransgressionConfiguration } from "../../redux/api/transgressionsApi";

export class MockData {
    static readonly getNoticeNo: NoticeNumber = {
        dateCreated: dayjs("2025-01-01").toISOString(),
        number: "25050W0010000960000269",
        sequentialNumber: 0,
        authorityCode: "",
        amount: {
            currency: "",
            amount: 0
        }
    }

    static readonly getCourtCaseList: CourtCaseEntry = {
        courtDate: "2025-01-03",
        courtName: "Brakwater Court",
        plateNumber: "RT46466",
        offenderName: "SDDF SDF",
        transgressionStatus: "ISSUED",
        noticeNumber: this.getNoticeNo.number,
    }

    static readonly getCourts: Court = {
        courtName: "Brakwater Court",
        courtCode: "05001-1",
        authorityCodes: ["W001"],
        districtCode: "WIN001",
        districtName: "Windhoek Magisterial District",
        address: {
            addressType: "Postal",
            country: "Namibia",
            lineOne: "Private Bag 13181",
            lineTwo: undefined,
            lineThree: undefined,
            code: "10005",
            city: "Windhoek",
        },
        courtRooms: [
            {
                room: "A",
                defaultRoom: true,
                courtRoomParameters: {
                    dailyRoomCapacity: 5,
                    operatingHours: 8,
                    contemptOfCourtFee: {
                        currency: "ZAR",
                        amount: 300,
                    },
                    scheduleFrom: "2024-10-01",
                    scheduleDateTo: "2025-12-19",
                    schedulingCycle: "WEEKLY",
                    recursOn: undefined,
                    operatingDays: [
                        "FRIDAY",
                    ],
                    nonCourtDates: [
                    ],
                },
                courtRoomBookings: [
                    {
                        operatingDate: "2024-10-04",
                        remainingCapacity: 50,
                    }
                ],
            },
            {
                room: "B",
                defaultRoom: false,
                courtRoomParameters: {
                    dailyRoomCapacity: 5,
                    operatingHours: 8,
                    contemptOfCourtFee: {
                        currency: "ZAR",
                        amount: 300,
                    },
                    scheduleFrom: "2024-10-01",
                    scheduleDateTo: "2025-12-19",
                    schedulingCycle: "WEEKLY",
                    recursOn: undefined,
                    operatingDays: [
                        "FRIDAY",
                    ],
                    nonCourtDates: [
                    ],
                },
                courtRoomBookings: [
                    {
                        operatingDate: "2024-10-04",
                        remainingCapacity: 50,
                    }
                ],
            },
        ],
    }

    static readonly getCourtResultSummary: CourtResultSummary = {
        courtDate: '2025-01-03',
        courtName: 'Brakwater Court',
        courtOutcome: 'WARRANT_OF_ARREST',
        noticeNumber: this.getNoticeNo.number,
        offenderName: 'FSAFA ASFFS',
        plateNumber: 'RT46466',
        transgressionStatus: 'WARRANT_OF_ARREST'
    }

    static readonly getTransgression: OverloadTransgression | RtqsTransgression = {
        type: "OverloadTransgression",
        status: "ISSUED",
        transgressionDate: "2025-02-19T10:47:16.048142",
        transgressionLocation: "Weighbridge",
        transgressionVersion: 2,
        gpsYCoordinate: undefined,
        gpsXCoordinate: undefined,
        authorityCode: "W001",
        noticeNumber: this.getNoticeNo,
        vehicle: {
            position: 0,
            vehicleType: "Box body",
            colour: undefined,
            grossVehicleMass: 50000,
            vehicleMake: undefined,
            vehicleModel: "",
            vehicleUsage: "Private",
            vehicleCategory: "Heavy Goods",
            plateNumber: "RT46466",
            vehicleIdentificationNumber: undefined,
            cargo: "Apparel, Clothing",
            axleUnits: undefined,
        },
        driver: {
            firstNames: "FSAFA",
            surname: "ASFFS",
            gender: "Female",
            dateOfBirth: "2025-02-19",
            identification: {
                primaryId: false,
                number: "12321",
                idType: "NATIONAL_ID",
                countryOfIssue: "Afghanistan",
            },
            contactNumber: {
                number: "2132131",
                dialingCode: "+1-242",
                contactNumberType: "Home",
            },
            depot: undefined,
            trn: undefined,
            licenceCode: "0",
            licenceNumber: undefined,
            prDPCodes: undefined,
            prDPNumber: undefined,
            countryOfIssue: "Armenia",
            age: "0",
            residentialAddressLine1: "SAFAFS",
            residentialAddressLine2: undefined,
            residentialCity: "SAAF",
            residentialPostalCode: "AFSS",
            residentialCountry: "Antigua and Barbuda",
            idCountryOfIssue: "Armenia",
            occupation: "Administrative Associate Professionals",
        },
        snapshotCharges: [
            {
                type: "SnapshotLoadCharge",
                chargeId: "9c816260-396c-5751-a9fa-a5dc5c357983",
                snapshotId: "54a62dd0-cc70-4b9b-ab59-eb327b298fd6",
                chargeCode: "26828",
                chargeTitle: "Mass axle:Manuf. spec. 401-800",
                chargeCategory: "AXLE_UNIT_STANDARD_TIRES_PERMISSIBLE_WEIGH_TEST",
                chargeShortDescription: "Sum wheel massloads > max.perm.axle massload as approved by manufacturer of tyre:401-800",
                chargeLongDescription: "Operated on a public road, a mini-bus, bus, tractor or goods vehicle with licence number *001 fitted with pneumatic tyres whilst the permissible maximum axle massload being the sum of all the wheel massloads on that axle, as approved by the manufacturer of the tyres, was exceeded. The permissible maximum axle massload was *043kg. whereas the actual massload was *044kg.",
                chargeRegulation: "Reg. 234 read with 238(1)(b)",
                specificRegulation: "Reg. 234 read with 89(1), Reg 238(1)(b), 248(1)(h) & 333(k) of the Nat. Road Traffic Regulations, 2000 G.G. 20963 dated 17/03/2000 -  & Sect 69 & 70 of Act 93 of 1996",
                severity: undefined,
                demeritPoints: undefined,
                fineAmount: {
                    currency: "ZAR",
                    amount: 1500,
                },
                discountAmount: undefined,
                plateNumber: "RT46466",
                maxValue: 4000,
                minValue: 1000
            }
        ],
        road: "Road",
        courtAppearanceDate: "2025-01-03",
        courtName: "Brakwater Court",
        courtNumber: "A",
        courtCode: "05001-1",
        totalAmountPayable: {
            currency: "ZAR",
            amount: 2700,
        },
        dialingCode: "+1-242",
        contactNumber: "+1-242 2132131",
        contactNumberType: "Home",
        emailAddress: undefined,
        officerId: undefined,
        officerName: "WOFF",
        officerSurname: "WOFF",
        issuingAuthority: "Development",
        paymentDueDate: "2025-03-05",
        paymentReference: "25050W0010000960000269",
        policeStationName: "Police Station 1",
        policeStationDistrict: "Police Station District",
        noOfPeaceOfficer: "WOFF",
        privateBag: "12030",
        town: "Windhoek",
        postalCode: "10005",
        sequenceNumber: 25020000001,
        operator: {
            name: undefined,
            depots: [
            ],
            businessAddressLine1: "SAFAFS",
            businessAddressLine2: undefined,
            businessPostalCode: "AFSS",
            businessCity: "SAAF",
            businessCountry: "Antigua and Barbuda",
            operatorDiscNumber: undefined,
        },
        route: {
            cargo: "Apparel, Clothing",
            destinationOfCargo: undefined,
            originOfCargo: undefined,
        },
    }

    static readonly getMoney: Money = {
        currency: "ZAR",
        amount: 500
    }

    static readonly getCourtResult: CourtResult = {
        courtResultId: "2e815659-982e-4ce0-8bcf-d3a631cff7f7",
        noticeNumber: this.getNoticeNo.number,
        courtOutcome: "WARRANT_OF_ARREST",
        caseNumber: "DF",
        plateNumber: "RT46466",
        offenderName: "FSAFA ASFFS",
        newCourtDate: undefined,
        courtDate: "2025-01-03",
        courtName: "Brakwater Court",
        courtRoom: "A",
        identificationNumber: "12321",
        transgressionStatus: "WARRANT_OF_ARREST",
        amountPaid: undefined,
        reason: undefined,
        receiptNumber: undefined,
        sentence: undefined,
        sentenceType: undefined,
        paymentMethod: undefined,
        sentenceLength: undefined,
        warrantNumber: "00000000000020250",
        sentenceTimePeriod: undefined,
        snapshotCharges: [
            {
                type: "SnapshotLoadCharge",
                chargeId: "9c816260-396c-5751-a9fa-a5dc5c357983",
                snapshotId: "54a62dd0-cc70-4b9b-ab59-eb327b298fd6",
                chargeCode: "26828",
                chargeTitle: "Mass axle:Manuf. spec. 401-800",
                chargeCategory: "AXLE_UNIT_STANDARD_TIRES_PERMISSIBLE_WEIGH_TEST",
                chargeShortDescription: "Sum wheel massloads > max.perm.axle massload as approved by manufacturer of tyre:401-800",
                chargeLongDescription: "Operated on a public road, a mini-bus, bus, tractor or goods vehicle with licence number *001 fitted with pneumatic tyres whilst the permissible maximum axle massload being the sum of all the wheel massloads on that axle, as approved by the manufacturer of the tyres, was exceeded. The permissible maximum axle massload was *043kg. whereas the actual massload was *044kg.",
                chargeRegulation: "Reg. 234 read with 238(1)(b)",
                specificRegulation: "Reg. 234 read with 89(1), Reg 238(1)(b), 248(1)(h) & 333(k) of the Nat. Road Traffic Regulations, 2000 G.G. 20963 dated 17/03/2000 -  & Sect 69 & 70 of Act 93 of 1996",
                severity: undefined,
                demeritPoints: undefined,
                fineAmount: {
                    currency: "ZAR",
                    amount: 1500,
                },
                discountAmount: undefined,
                plateNumber: "RT46466",
                maxValue: 4000,
                minValue: 100
            }
        ],
    }

    static readonly getTransgressionConfiguration: TransgressionConfiguration = {
        legislationType: "CPA",
        country: "Namibia",
        vehicleMake: false,
        vehicleModel: false,
        tripsDepotIdentifier: false,
        operatorName: false,
        operatorDiscNumber: false,
        emailAddress: false,
        contactNumber: false,
        contactNumberType: false,
        licenceCode: false,
        licenceNumber: false,
        prDPCode: false,
        prDPNumber: false,
        idCountryOfIssue: false,
        residentialAddressLine1: false,
        residentialAddressLine2: false,
        residentialCity: false,
        residentialCountry: false,
        residentialPostalCode: false,
        businessAddressLine1: false,
        businessAddressLine2: false,
        businessCity: false,
        businessCountry: false,
        businessPostalCode: false,
        occupation: false,
        depotName: false,
        colour: false,
        origin: false,
        destination: false,
        driverName: false,
        driverSurname: false,
        identificationType: false,
        identificationNumber: false,
        dateOfBirth: false,
        gender: false,
        trn: false,
        licenceCountryOfIssue: false,
        cargo: false,
        vehicleType: false,
        steeringAxleUnderloadRangeType: "PERCENTAGE",
        displayOptionalFields: true,
    }

    static readonly getCaseEntry: CourtCaseEntry = {
        courtDate: "2025-01-03",
        courtName: "Brakwater Court",
        plateNumber: "RT46466",
        offenderName: "FSAFA ASFFS",
        transgressionStatus: "WARRANT_OF_ARREST",
        noticeNumber: this.getNoticeNo.number
    }

    static readonly getBase64 =
        "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IDE+PgplbmRvYmoKMTQgMCBvYmoKPDwvY2EgMD4+CmVuZG9iagoxNSAwIG9iago8PC9jYSAxPj4KZW5kb2JqCjE2IDAgb2JqCjw8L2NhIDA+PgplbmRvYmoKMTcgMCBvYmoKPDwvY2EgMT4+CmVuZG9iagoxOCAwIG9iago8PC9jYSAwPj4KZW5kb2JqCjE5IDAgb2JqCjw8L2NhIDE+PgplbmRvYmoKNCAwIG9iago8PC9LaWRzWzEgMCBSIDUgMCBSIDcgMCBSXS9UeXBlL1BhZ2VzL0NvdW50IDM+PgplbmRvYmoKMjQgMCBvYmoKPDwvTmFtZXNbKEpSX1BBR0VfQU5DSE9SXzBfMSkgMjEgMCBSKEpSX1BBR0VfQU5DSE9SXzBfMikgMjIgMCBSKEpSX1BBR0VfQU5DSE9SXzBfMykgMjMgMCBSXT4+CmVuZG9iagoyNSAwIG9iago8PC9EZXN0cyAyNCAwIFI+PgplbmRvYmoKMjYgMCBvYmoKPDwvTmFtZXMgMjUgMCBSL1R5cGUvQ2F0YWxvZy9QYWdlcyA0IDAgUi9WaWV3ZXJQcmVmZXJlbmNlczw8L1ByaW50U2NhbGluZy9BcHBEZWZhdWx0Pj4+PgplbmRvYmoKMjcgMCBvYmoKPDwvQ3JlYXRvcihKYXNwZXJSZXBvcnRzIExpYnJhcnkgdmVyc2lvbiA2LjIxLjMtNGEzMDc4ZDIwNzg1ZWJlNDY0ZjE4MDM3ZDczOGQxMmZjOThjMTNjZikvQ3JlYXRpb25EYXRlKEQ6MjAyNDA1MjExMTUwMDUrMDInMDAnKS9Qcm9kdWNlcihPcGVuUERGIDEuMy4zMik+PgplbmRvYmoKeHJlZgowIDI4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwOTQyOCAwMDAwMCBuIAowMDAwMDE1OTcwIDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAxNjM2OCAwMDAwMCBuIAowMDAwMDExODU5IDAwMDAwIG4gCjAwMDAwMDk2MjQgMDAwMDAgbiAKMDAwMDAxNTUxOCAwMDAwMCBuIAowMDAwMDE2MDU4IDAwMDAwIG4gCjAwMDAwMTYwODMgMDAwMDAgbiAKMDAwMDAxNjEwOCAwMDAwMCBuIAowMDAwMDE2MTM0IDAwMDAwIG4gCjAwMDAwMTYxNjAgMDAwMDAgbiAKMDAwMDAxNjE4NiAwMDAwMCBuIAowMDAwMDE2MjEyIDAwMDAwIG4gCjAwMDAwMTYyMzggMDAwMDAgbiAKMDAwMDAxNjI2NCAwMDAwMCBuIAowMDAwMDE2MjkwIDAwMDAwIG4gCjAwMDAwMTYzMTYgMDAwMDAgbiAKMDAwMDAxNjM0MiAwMDAwMCBuIAowMDAwMDEyMDU1IDAwMDAwIG4gCjAwMDAwMTU4NjIgMDAwMDAgbiAKMDAwMDAxNTg5OCAwMDAwMCBuIAowMDAwMDE1OTM0IDAwMDAwIG4gCjAwMDAwMTY0MzEgMDAwMDAgbiAKMDAwMDAxNjU0MSAwMDAwMCBuIAowMDAwMDE2NTc1IDAwMDAwIG4gCjAwMDAwMTY2ODAgMDAwMDAgbiAKdHJhaWxlcgo8PC9JbmZvIDI3IDAgUi9JRCBbPDgxZDE4NjQ1OWYzZmUwOTI0ODU0M2E0NjkwODViOGU4Pjw4MWQxODY0NTlmM2ZlMDkyNDg1NDNhNDY5MDg1YjhlOD5dL1Jvb3QgMjYgMCBSL1NpemUgMjg+PgpzdGFydHhyZWYKMTY4NTEKJSVFT0YK";
}
