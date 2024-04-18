import { ContactModel } from "../../src/models/contact-model";
import { DataStoreContext } from "../../src/models/data-store-context";
import { DonationItemModel } from "../../src/models/donation-item-model";
import { RequestModel } from "../../src/models/request-model";
import { UserModel } from "../../src/models/user-model";

describe("DataStoreContext", () => {
  let dsContext: DataStoreContext;

  beforeEach(() => {
    dsContext = new DataStoreContext(true);
  });

  it("should initialize user model", () => {
    expect(dsContext.user).toBeInstanceOf(UserModel);
  });

  it("should initialize donation item model", () => {
    expect(dsContext.donationItem).toBeInstanceOf(DonationItemModel);
  });

  it("should initialize request model", () => {
    expect(dsContext.request).toBeInstanceOf(RequestModel);
  });

  it("should initialize contact model", () => {
    expect(dsContext.contact).toBeInstanceOf(ContactModel);
  });
});
