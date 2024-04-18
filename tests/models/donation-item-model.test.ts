import {
  DonationItemModel,
  DonationItemDocument,
} from "../../src/models/donation-item-model";
import DataStore from "@seald-io/nedb";
import {
  Category,
  DateType,
  DonationStatus,
  MeasurementType,
  StorageRequirement,
} from "../../src/models/enums";

describe("DonationItemModel", () => {
  let donationItemModel: DonationItemModel;
  let datastore: DataStore<DonationItemDocument>;

  beforeEach(async () => {
    // Create an in memory datastore
    datastore = new DataStore();
    donationItemModel = new DonationItemModel(datastore);

    // Seed the datastore with some data
    const donationItems: DonationItemDocument[] = [
      {
        _id: "a",
        name: "Broccoli",
        description:
          "Broccoli is an edible green plant in the cabbage family whose large flowering head, stalk and small associated leaves are eaten as a vegetable",
        storageRequirement: StorageRequirement.AMBIENT,
        category: Category.VEGETABLE,
        dateCreated: new Date(),
        measurement: {
          type: MeasurementType.KG,
          value: 1,
        },
        dateInfo: {
          dateType: DateType.BEST_BEFORE,
          date: new Date(new Date().setDate(new Date().getDate() + 3)),
        },
        imageFilename: "seed-broccoli.jpg",
        status: DonationStatus.AVAILABLE,
        address: {
          street: "3 Kelvingrove St",
          city: "Glasgow",
          postcode: "G3 7RX",
          coordinates: {
            latitude: 55.865012,
            longitude: -4.284227,
          },
        },
        userId: "d",
      },
      {
        _id: "b",
        name: "Batard",
        description:
          "A short loaf of French bread having an oval or oblong shape.",
        storageRequirement: StorageRequirement.AMBIENT,
        category: Category.BAKERY,
        dateCreated: new Date(),
        measurement: {
          type: MeasurementType.UNIT,
          value: 5,
        },
        dateInfo: {
          dateType: DateType.USE_BY,
          date: new Date(new Date().setDate(new Date().getDate() + 2)),
        },
        imageFilename: "seed-batard.jpg",
        status: DonationStatus.COMPLETED,
        address: {
          street: "3 Kelvingrove St",
          city: "Glasgow",
          postcode: "G3 7RX",
          coordinates: {
            latitude: 55.865012,
            longitude: -4.284227,
          },
        },
        userId: "d",
      },
      {
        _id: "f",
        name: "apples",
        description:
          "An apple is a round, edible fruit produced by an apple tree Apple trees are cultivated worldwide and are the most widely grown species in the genus Malus.",
        storageRequirement: StorageRequirement.AMBIENT,
        category: Category.FRUIT,
        dateCreated: new Date(),
        measurement: {
          type: MeasurementType.UNIT,
          value: 33,
        },
        dateInfo: {
          dateType: DateType.PRODUCTION_DATE,
          date: new Date(new Date().setDate(new Date().getDate() - 3)),
        },
        imageFilename: "seed-apples.jpg",
        status: DonationStatus.AVAILABLE,
        address: {
          street: "210 Garscube Rd",
          city: "Glasgow",
          postcode: "G4 9RR",
          coordinates: {
            latitude: 55.871611,
            longitude: -4.260784,
          },
        },
        userId: "d",
      },
    ];

    // Insert the donation items into the datastore
    await datastore.insertAsync(donationItems);
  });

  describe("findDonationItemsByUserId", () => {
    it("should return an array of donation items for a given user ID", async () => {
      // Arrange
      const userId = "d";

      // Act
      const result = await donationItemModel.findDonationItemsByUserId(userId);

      // Assert
      expect(result).toHaveLength(3);
    });

    it("should return an empty array if no donation items are found for a given user ID", async () => {
      // Arrange
      const userId = "e";

      // Act
      const result = await donationItemModel.findDonationItemsByUserId(userId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe("acceptDonationItem", () => {
    it("should accept a donation item by updating the status to claimed", async () => {
      // Arrange
      const donationItemId = "a";

      // Act
      await donationItemModel.acceptDonationItem(donationItemId);

      // Assert
      const result = await datastore.findOneAsync({ _id: donationItemId });
      expect(result!.status).toEqual(DonationStatus.CLAIMED);
    });

    it("should throw an error if the donationItem does not exist", async () => {
      // Arrange
      const donationItemId = "c";

      // Act and Assert
      await expect(
        donationItemModel.acceptDonationItem(donationItemId)
      ).rejects.toThrow("Donation item not found");
    });

    it("should throuw an error if the donation item is already claimed or completed", async () => {
      // Arrange
      const donationItemId = "b";

      // Act and Assert
      await expect(
        donationItemModel.acceptDonationItem(donationItemId)
      ).rejects.toThrow("Donation item already claimed or completed");
    });
  });

  describe("findNotOutOfDate", () => {
    it("should find donations that are not out of date", async () => {
      // Arrange
      const daysAfterBestBefore = 0;
      const daysAfterProduction = 0;

      // Act
      const result = await donationItemModel.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction
      );

      // Assert
      expect(result).toHaveLength(1);
    });

    it("should find donations that are not out of date and are 3 days after best before date", async () => {
      // Arrange
      const daysAfterBestBefore = 3;
      const daysAfterProduction = 0;

      // Act
      const result = await donationItemModel.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction
      );

      // Assert
      expect(result).toHaveLength(1);
    });

    it("should find donations that are not out of date and are 3 days after production date", async () => {
      // Arrange
      const daysAfterBestBefore = 0;
      const daysAfterProduction = 3;

      // Act
      const result = await donationItemModel.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction
      );

      // Assert
      expect(result).toHaveLength(2);
    });

    it("should find donations that are not out of date and match a category", async () => {
      // Arrange
      const daysAfterBestBefore = 0;
      const daysAfterProduction = 7;
      const category = Category.FRUIT;

      // Act
      const result = await donationItemModel.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction,
        category
      );

      // Assert
      expect(result).toHaveLength(1);
    });

    it("should find donations that are not out of date and match a search term", async () => {
      // Arrange
      const daysAfterBestBefore = 0;
      const daysAfterProduction = 0;
      const searchTerm = "Broc";

      // Act
      const result = await donationItemModel.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction,
        undefined,
        searchTerm
      );

      // Assert
      expect(result).toHaveLength(1);
    });
  });
});
