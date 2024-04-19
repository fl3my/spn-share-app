import { dsContext } from "../models/data-store-context";
import { DonationItemDocument } from "../models/donation-item-model";
import {
  Category,
  DateType,
  DeliveryMethod,
  DonationStatus,
  MeasurementType,
  RequestStatus,
  Role,
  StorageRequirement,
} from "../models/enums";
import { UserDocument } from "../models/user-model";
import argon2 from "argon2";
import dotenv from "dotenv";
import { RequestDocument } from "../models/request-model";

// Load environment variables
dotenv.config();

// Insert seed data for users
const insertUsers = async () => {
  // Get the common password from the environment variables
  const password = process.env.SEED_USERS_COMMON_PASSWORD || "password";
  const commonPassword = await argon2.hash(password);

  // Define the user seed data
  const users: UserDocument[] = [
    {
      _id: "a",
      email: "admin@example.com",
      password: commonPassword,
      role: Role.ADMIN,
      firstname: "Admin",
      lastname: "User",
      mobile: "0123456789",
      address: {
        street: "10 Salmona St",
        city: "Glasgow",
        postcode: "G22 5NZ",
        coordinates: {
          latitude: 55.864558,
          longitude: -4.248875,
        },
      },
      score: 0,
    },
    {
      _id: "b",
      email: "pantry@example.com",
      password: commonPassword,
      role: Role.PANTRY,
      firstname: "Pantry",
      lastname: "User",
      mobile: "0123456789",
      score: 0,
      address: {
        street: "22 Lilybank Rd",
        city: "Port Glasgow",
        postcode: "PA14 5AN",
        coordinates: {
          latitude: 55.935148,
          longitude: -4.703772,
        },
      },
    },
    {
      _id: "c",
      email: "warehouse@example.com",
      password: commonPassword,
      role: Role.WAREHOUSE,
      firstname: "Warehouse",
      lastname: "User",
      mobile: "0123456789",
      score: 0,
      address: {
        street: "150 Albert Dr",
        city: "Glasgow",
        postcode: "G41 2NG",
        coordinates: {
          latitude: 55.851961,
          longitude: -4.27077,
        },
      },
    },
    {
      _id: "d",
      email: "donator1@example.com",
      password: commonPassword,
      role: Role.DONATOR,
      firstname: "Donator",
      lastname: "User",
      mobile: "0123456789",
      score: 0,
      address: {
        street: "210 Garscube Rd",
        city: "Glasgow",
        postcode: "G4 9RR",
        coordinates: {
          latitude: 55.871611,
          longitude: -4.260784,
        },
      },
    },
    {
      _id: "e",
      email: "donator2@example.com",
      password: commonPassword,
      role: Role.DONATOR,
      firstname: "Donator",
      lastname: "User",
      mobile: "0123456789",
      score: 0,
      address: {
        street: "3 Kelvingrove St",
        city: "Glasgow",
        postcode: "G3 7RX",
        coordinates: {
          latitude: 55.865012,
          longitude: -4.284227,
        },
      },
    },
  ];

  try {
    await Promise.all(users.map((user) => dsContext.user.insert(user)));
  } catch (error) {
    console.log("error inserting user:", error);
  }
};

// Insert seed data for donation items
const insertDonationItems = async () => {
  // Define the donation item seed data
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
      _id: "c",
      name: "Strawberries",
      description:
        "The garden strawberry is a widely grown hybrid species of the genus Fragaria, collectively known as the strawberries, which are cultivated worldwide for their fruit.",
      storageRequirement: StorageRequirement.COLD,
      category: Category.FRUIT,
      dateCreated: new Date(),
      measurement: {
        type: MeasurementType.KG,
        value: 2,
      },
      dateInfo: {
        dateType: DateType.USE_BY,
        date: new Date(new Date().setDate(new Date().getDate() + 1)),
      },
      imageFilename: "seed-strawberries.jpg",
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
      _id: "d",
      name: "Celery",
      description:
        "Celery is a marshland plant in the family Apiaceae that has been cultivated as a vegetable since ancient times.",
      storageRequirement: StorageRequirement.AMBIENT,
      category: Category.VEGETABLE,
      dateCreated: new Date(),
      measurement: {
        type: MeasurementType.KG,
        value: 3,
      },
      dateInfo: {
        dateType: DateType.BEST_BEFORE,
        date: new Date(new Date().setDate(new Date().getDate() + 6)),
      },
      imageFilename: "seed-celery.jpg",
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
      userId: "e",
    },
    {
      _id: "e",
      name: "Banana",
      description:
        "A banana is an elongated, edible fruit – botanically a berry – produced by several kinds of large herbaceous flowering plants in the genus Musa.",
      storageRequirement: StorageRequirement.AMBIENT,
      category: Category.FRUIT,
      dateCreated: new Date(),
      measurement: {
        type: MeasurementType.KG,
        value: 12,
      },
      dateInfo: {
        dateType: DateType.BEST_BEFORE,
        date: new Date(new Date().setDate(new Date().getDate())),
      },
      imageFilename: "seed-banana.jpg",
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
      userId: "e",
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
      userId: "e",
    },
  ];
  try {
    await Promise.all(
      donationItems.map((donationItem) =>
        dsContext.donationItem.insert(donationItem)
      )
    );
  } catch (error) {
    console.log("error inserting donation item:", error);
  }
};

// Insert seed data for requests
const insertRequests = async () => {
  const requests: RequestDocument[] = [];

  // Create the automatic requests for the warehouse
  for (let i = 0; i < 6; i++) {
    requests.push({
      userId: "c",
      donationItemId: String.fromCharCode(97 + i),
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
    });
  }

  try {
    await Promise.all(
      requests.map((request) => dsContext.request.insert(request))
    );
  } catch (error) {
    console.log("error inserting request:", error);
  }
};

const seed = async () => {
  await insertUsers();
  await insertDonationItems();
  await insertRequests();
};

seed().catch(console.error);
