# spn-share-app

> This is an web application developed for the Scottish Pantry Network that allows users to donate food items to pantry. Donators are able to post donations which can be viewed by each pantry and requested if desired. The donator then has the choice of which pantry to deliver to.

## Installation

First, install the programs required to run the application:

- Git
- Node.js

Next, clone the repository and install dependancies:

```
git clone https://github.com/fl3my/spn-share-app.git
```

```
npm install
```

Before seeding the datastore add the enviroment variables:

```
touch .env
```

```
HOST = "localhost"
PORT = "3000"
ESSION_SECRET = "your_session_secret" # Replace with your actual session secret
TOMTOM_API_KEY = "your_api_key" # Replace with your actual API key
SEED_USERS_COMMON_PASSWORD = "your_users_password"  # Replace with your actual password
```

Then seed the datastore:

```
npm run seed
```

Now, start the development enviroment with the following command:

```
npm run dev
```

## Client requirements

- Pantries cant control what food items they get from fair share, so foften end up with items they don't want.
- Donators should be able to donate items to a pantry but only if they want it.
- Planning to have a central warehouse in the future.
- Must work with minimum staff.

## Features Implemented

- Donators have the option to deliver their item to a warehouse or directly to pantry that accepts it.
- Pantries can upload excess donation items for other pantries to collect.
- Map so donators can view the location of the pantry that has requested their donation.
- Scoring system and leaderboard for donators to motivate donators to donate.
- Complex search query for donators to find donations.
- Different date types to allow for more precise search for items.
- Added donation item storage properties as some items may need to be frozen or in fridge.
- SCSS to allow the default bootstrap theme colours to be altered easily.

## Entity relationship diagram

```mermaid
    erDiagram
    User ||--|| Address : has
    User ||--o{ DonationItem : "creates"
    User {
        string _id
        string email
        string password
        string firstname
        string lastname
        string phoneNumber
        string role
        integer score
    }
    DonationItem ||--|| Measurement : has
    DonationItem ||--|| DateInfo : has
    DonationItem ||--|| Address : has
    DonationItem {
        string userId
        string name
        string description
        StorageRequirement storageRequirement
        Category category
        date dateCreated
        string imageFilename
        DonationStatus status
    }
    Measurement {
        MeasurementType type
        number value
    }
    DateInfo {
        DateType dateType
        date date
    }
    User ||--o{ Request : "requests"
    DonationItem ||--o{ Request : "requested in"
    Request ||--|| Address : has
    Address ||--|| Coordinates : has
    Request {
        string userId
        string donationItemId
        date dateRequested
        DeliveryMethod deliveryMethod
        RequestStatus status
    }
    Address {
        string street
        string city
        string postcode
    }
    Coordinates {
        float latitiude
        float longitude
    }
```
