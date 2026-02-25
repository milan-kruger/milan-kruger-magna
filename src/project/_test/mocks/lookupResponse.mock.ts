import { PageLookupResponse } from "../../redux/api/coreApi";

export const mockPageLookupResponse: PageLookupResponse = {
    totalElements: 2,
    totalPages: 1,
    pageable: {
        pageNumber: 0,
        pageSize: 10,
        offset: 0,
        sort: {
            sorted: true,
            unsorted: false,
            empty: false,
        },
        paged: true,
        unpaged: false,
    },
    first: true,
    last: true,
    size: 10,
    content: [
        {
            lookupValue: "Test Lookup",
            lookupType: "VEHICLE_MAKE",
            startDate: "2025-02-27T08:27:55.769",
            lookupCode: "45",
            id: 1024,
            childCount: 1,
            lookupId: "52d0c21b-ae62-561c-b162-5e2e4932a432",
        },
        {
            lookupValue: "Mock Lookup",
            lookupType: "VEHICLE_MODEL",
            startDate: "2023-01-01",
            lookupCode: "741",
            id: 2,
            lookupId: 'e40c761b-724d-5398-8e93-b8d9923c9ef2'
        },
    ],
    number: 0,
    sort: {
        sorted: true,
        unsorted: false,
        empty: false,
    },
    numberOfElements: 2,
    empty: false,
};