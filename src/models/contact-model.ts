import DataStore from "@seald-io/nedb";

import { Document, DocumentModel } from "./document-model";

interface ContactDocument extends Document {
  name: string;
  email: string;
  message: string;
  sentAt: Date;
}

export class ContactModel extends DocumentModel<ContactDocument> {
  constructor(db: DataStore<ContactDocument>) {
    super(db);
  }
}
