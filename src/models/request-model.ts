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
}
