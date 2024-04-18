import DataStore from "@seald-io/nedb";
import { RequestDocument, RequestModel } from "../../src/models/request-model";
import { DeliveryMethod, RequestStatus } from "../../src/models/enums";

// Seed the datastore with some data
const requests: RequestDocument[] = [
  {
    _id: "a",
    userId: "a",
    donationItemId: "a",
    status: RequestStatus.PENDING,
    dateRequested: new Date(),
    deliveryMethod: DeliveryMethod.RECIEVE,
    address: {
      street: "150 Albert Dr",
      city: "Glasgow",
      postcode: "G41 2NG",
      coordinates: {
        latitude: 55.851961,
        longitude: -4.27077,
      },
    },
    additionalNotes: "This was automatically requested by the warehouse.",
  },
  {
    _id: "b",
    userId: "b",
    donationItemId: "a",
    status: RequestStatus.PENDING,
    dateRequested: new Date(),
    deliveryMethod: DeliveryMethod.RECIEVE,
    address: {
      street: "150 Albert Dr",
      city: "Glasgow",
      postcode: "G41 2NG",
      coordinates: {
        latitude: 55.851961,
        longitude: -4.27077,
      },
    },
    additionalNotes: "This was automatically requested by the warehouse.",
  },
  {
    _id: "c",
    userId: "c",
    donationItemId: "a",
    status: RequestStatus.PENDING,
    dateRequested: new Date(),
    deliveryMethod: DeliveryMethod.RECIEVE,
    address: {
      street: "150 Albert Dr",
      city: "Glasgow",
      postcode: "G41 2NG",
      coordinates: {
        latitude: 55.851961,
        longitude: -4.27077,
      },
    },
    additionalNotes: "This was automatically requested by the warehouse.",
  },
  {
    _id: "d",
    userId: "b",
    donationItemId: "b",
    status: RequestStatus.COMPLETED,
    dateRequested: new Date(),
    deliveryMethod: DeliveryMethod.RECIEVE,
    address: {
      street: "150 Albert Dr",
      city: "Glasgow",
      postcode: "G41 2NG",
      coordinates: {
        latitude: 55.851961,
        longitude: -4.27077,
      },
    },
    additionalNotes: "This was automatically requested by the warehouse.",
  },
];

describe("RequestModel", () => {
  let requestModel: RequestModel;
  let datastore: DataStore<RequestDocument>;

  beforeEach(async () => {
    // Create an in memory datastore
    datastore = new DataStore();
    requestModel = new RequestModel(datastore);

    // Seed the datastore with requests
    await datastore.insertAsync(requests);
  });

  describe("findRequestsByUserId", () => {
    it("should return a list of requests with the specified user ID", async () => {
      // Arrange
      const userId = "a";

      // Act
      const result = await requestModel.findRequestsByUserId(userId);

      // Assert
      const expectedRequests = requests.filter((r) => r.userId === userId);
      expect(result).toEqual(expectedRequests);
    });
  });

  describe("requestExists", () => {
    it("should return true if a request exists for the given donation item ID", async () => {
      // Arrange
      const donationItemId = "a";
      const userId = "a";

      // Act
      const result = await requestModel.requestExists(donationItemId, userId);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false if a request does not exist for the given donation item ID", async () => {
      // Arrange
      const donationItemId = "b";
      const userId = "a";

      // Act
      const result = await requestModel.requestExists(donationItemId, userId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("findRequestsByDonationItemId", () => {
    it("should return a list of requests with the specified donation item ID", async () => {
      // Arrange
      const donationItemId = "a";

      // Act
      const result = await requestModel.findRequestsByDonationItemId(
        donationItemId
      );

      // Assert
      const expectedRequests = requests.filter(
        (r) => r.donationItemId === donationItemId
      );
      expect(result).toEqual(expectedRequests);
    });
  });

  describe("getRequestCountByDonationItemId", () => {
    it("should return the number of requests for the specified donation item ID", async () => {
      // Arrange
      const donationItemId = "a";

      // Act
      const result = await requestModel.getRequestCountByDonationItemId(
        donationItemId
      );

      // Assert
      const expectedRequests = requests.filter(
        (r) => r.donationItemId === donationItemId
      );
      expect(result).toEqual(expectedRequests.length);
    });
  });

  describe("acceptRequest", () => {
    it("should accept a request by updating the status to accepted", async () => {
      // Arrange
      const requestId = "a";

      // Act
      await requestModel.acceptRequest(requestId);

      // Assert
      const updatedRequest = await datastore.findOneAsync({ _id: requestId });
      expect(updatedRequest.status).toBe(RequestStatus.ACCEPTED);
    });

    it("should throw an error if the request does not exist", async () => {
      // Arrange
      const requestId = "e";

      // Act
      const result = requestModel.acceptRequest(requestId);

      // Assert
      await expect(result).rejects.toThrow("Request not found");
    });

    it("should throw an error if the request is already accepted or completed", async () => {
      // Arrange
      const requestId = "d";

      // Act
      const result = requestModel.acceptRequest(requestId);

      // Assert
      await expect(result).rejects.toThrow("Request already accepted");
    });
  });

  describe("rejectOtherRequests", () => {
    it("should reject all other requests for the same donation item", async () => {
      // Arrange
      const donationItemId = "a";
      const requestId = "a";

      // Act
      await requestModel.rejectOtherRequests(donationItemId, requestId);

      // Assert
      const result = await datastore.findAsync({ donationItemId });

      const expectedRequests = result.filter(
        (r) => r.donationItemId === donationItemId && r._id !== requestId
      );

      expectedRequests.forEach((request) => {
        expect(request.status).toBe(RequestStatus.REJECTED);
      });
    });
  });
});
