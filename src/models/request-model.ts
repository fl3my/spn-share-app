import DataStore from "@seald-io/nedb";
import { DocumentModel, Document } from "./document-model";
import { DeliveryMethod, RequestStatus } from "./enums";

interface Address {
  street: string;
  city: string;
  county: string;
  postcode: string;
}

// Define the RequestDocument interface
interface RequestDocument extends Document {
  userId: string;
  donationItemId: string;
  dateRequested: Date;
  deliveryMethod: DeliveryMethod;
  status: RequestStatus;
  address: Address;
}

// Define the RequestModel class
export class RequestModel extends DocumentModel<RequestDocument> {
  constructor(db: DataStore<RequestDocument>) {
    super(db);
  }

  // Find all requests by user ID
  async findRequestsByUserId(userId: string): Promise<RequestDocument[]> {
    try {
      return await this.db.findAsync({ userId });
    } catch (error) {
      console.error("Error finding requests by user ID: ", error);
      throw error;
    }
  }

  // Returns true if a request exists for the given donation item ID
  async requestExists(
    donationItemId: string,
    userId: string
  ): Promise<boolean> {
    const existingRequest = await this.db.findOneAsync({
      donationItemId,
      userId,
    });
    return !!existingRequest;
  }

  async findRequestsByDonationItemId(
    donationItemId: string
  ): Promise<RequestDocument[]> {
    try {
      return await this.db
        .findAsync({ donationItemId })
        .sort({ dateRequested: -1 });
    } catch (error) {
      console.error("Error finding requests by donation item ID: ", error);
      throw error;
    }
  }

  async getRequestCountByDonationItemId(
    donationItemId: string
  ): Promise<number> {
    try {
      // Count the number of requests for the donation item ID
      return await this.db.countAsync({ donationItemId });
    } catch (error) {
      console.error("Error getting request count by donation item ID: ", error);
      throw error;
    }
  }

  async acceptRequest(requestId: string): Promise<RequestDocument> {
    try {
      // Find the request by ID
      const request = await this.db.findOneAsync({ _id: requestId });

      // Check if the request exists
      if (!request) {
        throw new Error("Request not found");
      }

      // Check if the request is already accepted
      if (request.status === RequestStatus.ACCEPTED) {
        throw new Error("Request already accepted");
      }

      // Update the request status to accepted
      request.status = RequestStatus.ACCEPTED;

      // Update the request in the database
      const updatedRequest = await super.update(requestId, request);

      // Check if the request was updated
      if (!updatedRequest) {
        throw new Error("Error accepting request");
      }

      return updatedRequest;
    } catch (error) {
      console.error("Error accepting request: ", error);
      throw error;
    }
  }
}
