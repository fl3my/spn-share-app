// Define the roles that a user can have
export enum Role {
  DONATOR = "DONATOR",
  PANTRY = "PANTRY",
  ADMIN = "ADMIN",
}

// Define the measurement types
export enum MeasurementType {
  UNIT = "UNIT",
  KG = "KG",
}

// Define the categories
export enum Category {
  FRUIT = "FRUIT",
  VEGETABLE = "VEGETABLE",
  MEAT = "MEAT",
  DAIRY = "DAIRY",
  GRAIN = "GRAIN",
  SEAFOOD = "SEAFOOD",
  BEVERAGE = "BEVERAGE",
  SNACK = "SNACK",
  BAKERY = "BAKERY",
  OTHER = "OTHER",
}

// Define the storage requirements
export enum StorageRequirement {
  AMBIENT = "AMBIENT",
  COLD = "COLD",
  FROZEN = "FROZEN",
}

export enum DateType {
  USE_BY = "USE_BY",
  BEST_BEFORE = "BEST_BEFORE",
  PRODUCTION_DATE = "PRODUCTION_DATE",
}
