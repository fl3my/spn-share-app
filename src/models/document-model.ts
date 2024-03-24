import DataStore from "@seald-io/nedb";

// Define an inteface for the document object
export interface Document {
  _id?: string;
}

// This is the base document model class that will be extended by all other models
export class DocumentModel<T extends Document> {
  protected db: DataStore<T>;

  // The constructor takes in an instance of the datastore
  constructor(db: DataStore<T>) {
    this.db = db;
  }

  // Find all documents in the collection
  async findAll(): Promise<T[]> {
    try {
      return await this.db.findAsync({});
    } catch (error) {
      console.error("Error finding all documents:", error);
      throw error;
    }
  }

  // Find a document by id
  async findById(id: string): Promise<T | null> {
    try {
      return await this.db.findOneAsync({ _id: id });
    } catch (error) {
      console.error(`Error finding document by id ${id}:`, error);
      throw error;
    }
  }

  // Insert a document into the collection
  async insert(document: T): Promise<T> {
    try {
      return await this.db.insertAsync(document);
    } catch (error) {
      console.error("Error inserting document:", error);
      throw error;
    }
  }

  // Update a document in the collection
  async update(
    id: string,
    document: Omit<Partial<T>, "_id">
  ): Promise<T | null> {
    try {
      // Return the updated document if it exists
      const { affectedDocuments } = await this.db.updateAsync(
        { _id: id },
        { $set: document },
        { returnUpdatedDocs: true }
      );
      return affectedDocuments;
    } catch (error) {
      console.error(`Error updating document with id ${id}:`, error);
      throw error;
    }
  }

  // Remove a document from the collection
  async remove(id: string): Promise<boolean> {
    try {
      // Remove the document and return amount of removed documents
      const numRemoved = await this.db.removeAsync({ _id: id }, {});

      // Return true if a document was removed
      return numRemoved > 0;
    } catch (error) {
      console.error(`Error removing document with id ${id}:`, error);
      throw error;
    }
  }
}
