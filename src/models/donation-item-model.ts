import DataStore from "@seald-io/nedb";
import { DocumentModel, Document } from "./document-model";
import {
  Category,
  MeasurementType,
  StorageRequirement,
  DateType,
} from "./enums";

// Define an interface for the measurement
interface Measurement {
  type: MeasurementType;
  value: number;
}

// Define an interface for the date information
interface DateInfo {
  dateType: DateType;
  date: Date;
}
// Define an interface for the donation item document object
interface DonationItemDocument extends Document {
  userId?: string;
  name: string;
  description: string;
  storageRequirement: StorageRequirement;
  category: Category;
  dateCreated?: Date;
  measurement: Measurement;
  dateInfo: DateInfo;
}

// This is the donation item model class that extends the base document model
export class DonationItemModel extends DocumentModel<DonationItemDocument> {
  constructor(db: DataStore<DonationItemDocument>) {
    super(db);
  }

  // Create a new donation item
  async createDonationItem(
    userId: string,
    donationItem: DonationItemDocument
  ): Promise<DonationItemDocument> {
    // Add the hidden properties to the donation item
    const donationItemDocument: DonationItemDocument = {
      ...donationItem,
      userId: userId,
      dateCreated: new Date(),
    };

    // Insert the donation item into the database using the base class insert method
    return super.insert(donationItemDocument);
  }

  // Find all donation items by user ID
  async findDonationItemsByUserId(
    userId: string
  ): Promise<DonationItemDocument[]> {
    try {
      return await this.db.findAsync({ userId });
    } catch (error) {
      console.error("Error finding donations by user ID: ", error);
      throw error;
    }
  }
}
