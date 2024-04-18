import DataStore from "@seald-io/nedb";

import { DocumentModel, Document } from "./document-model";
import {
  Category,
  MeasurementType,
  StorageRequirement,
  DateType,
  DonationStatus,
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

interface Address {
  street: string;
  city: string;
  postcode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Define an interface for the donation item document object
export interface DonationItemDocument extends Document {
  userId?: string;
  name: string;
  description: string;
  storageRequirement: StorageRequirement;
  category: Category;
  dateCreated?: Date;
  measurement: Measurement;
  dateInfo: DateInfo;
  imageFilename: string;
  status: DonationStatus;
  address: Address;
}

// This is the donation item model class that extends the base document model
export class DonationItemModel extends DocumentModel<DonationItemDocument> {
  constructor(db: DataStore<DonationItemDocument>) {
    super(db);
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

  async acceptDonationItem(id: string) {
    try {
      // Find the donation by ID
      const donationItem = await super.findById(id);

      // Check if the donation exists
      if (!donationItem) {
        throw new Error("Doantion item not found");
      }

      // Check if the donation item is already completed or claimed
      if (
        donationItem.status === DonationStatus.CLAIMED ||
        donationItem.status === DonationStatus.COMPLETED
      ) {
        throw new Error("Donation item already claimed or completed");
      }
      // Update the donation in the database  with claimed
      return await super.update(id, {
        status: DonationStatus.CLAIMED,
      });
    } catch (error) {
      console.error("Error accepting donation item: ", error);
      throw error;
    }
  }

  async findNotOutOfDate(
    daysAfterBestBefore: number,
    daysAfterProduction: number,
    category?: string,
    searchTerm?: string
  ): Promise<DonationItemDocument[]> {
    try {
      // Get the current date
      const now = new Date();

      // Set the time to midnight
      now.setHours(0, 0, 0, 0);

      // Calculate the best before date based on the days after best before
      const bestBeforeDate = new Date(now);
      bestBeforeDate.setDate(bestBeforeDate.getDate() - daysAfterBestBefore);

      // Calculate the production date based on the days after production
      const productionDate = new Date(now);
      productionDate.setDate(productionDate.getDate() - daysAfterProduction);

      // Create the base query
      let query: any = {
        status: DonationStatus.AVAILABLE, // Get all donations that are available
        $or: [
          {
            "dateInfo.dateType": DateType.USE_BY,
            "dateInfo.date": { $gte: now },
          },
          {
            "dateInfo.dateType": DateType.BEST_BEFORE,
            "dateInfo.date": { $gte: bestBeforeDate },
          },
          {
            "dateInfo.dateType": DateType.PRODUCTION_DATE,
            "dateInfo.date": { $gte: productionDate },
          },
        ],
      };

      // If a category is provided, add it to the query
      if (category) {
        query.category = category;
      }

      // If search term are provided, add them to the query
      if (searchTerm) {
        // Use a regex to search for the name
        query.name = { $regex: new RegExp(searchTerm, "i") };
      }

      // Find all donation items that match the query
      return await this.db.findAsync(query).sort({ dateCreated: -1 });
    } catch (error) {
      console.error("Error finding donations not out of date: ", error);
      throw error;
    }
  }
}
