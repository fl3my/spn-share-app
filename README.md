# spn-share-app

Coursework 2 for GCU Web App Development 2.

## Entity relationship diagram

```mermaid
    erDiagram
    User ||--o{ DonationItem : "creates"
    User {
        string _id
        string email
        string password
        string firstname
        string lastname
        string phoneNumber
        string role
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
    Request ||--|| DateTimeRange : has

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
    DateTimeRange {
        date start
        date end
    }
```
