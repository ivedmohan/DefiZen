
import { mockPrisma as db } from "../db-mock";

interface Contact {
  id?: number;
  userWallet: string;
  contactWallet: string;
  contactName: string;
  contactType?: string;
  isActive?: boolean;
  tags?: string[];
  notes?: string;
  createdAt?: Date;
  lastInteraction?: Date;
}

interface Input {
  userAddress: string;
  name: string;
  contactAddress: string;
}

// Legacy function for backward compatibility
export const AddUserContact = async (input: Input) => {
  try {
    const { userAddress, name, contactAddress } = input;
    
    if (userAddress === "" || name === "" || contactAddress === "") {
      return { 
        success: false,
        data: `Missing the parameters`
      };
    }

    const result = await addContact(userAddress, contactAddress, name);
    return { 
      success: result.success, 
      data: result.contact || result.message 
    };
    
  } catch (err: any) {
    console.log("Error inserting contacts into the Database", err);
    return { 
      success: false, 
      data: `Error: ${err?.message || err}` 
    };
  }
};

export async function addContact(
  userWallet: string,
  contactWallet: string,
  contactName: string,
  contactType: string = "friend",
  tags: string[] = [],
  notes: string = ""
): Promise<any> {
  try {
    console.log(`📝 Adding new contact: ${contactName} (${contactWallet}) for user: ${userWallet}`);
    
    // Validate wallet addresses
    if (!userWallet || !contactWallet || !contactName) {
      throw new Error("Missing required fields: userWallet, contactWallet, or contactName");
    }

    if (userWallet === contactWallet) {
      throw new Error("Cannot add yourself as a contact");
    }

    // Check if contact already exists
    const existingContacts = await db.userContact.findMany({
      where: {
        userWallet: userWallet,
        contactWallet: contactWallet
      }
    });

    if (existingContacts && existingContacts.length > 0) {
      return {
        success: false,
        message: `Contact with wallet ${contactWallet} already exists`,
        contact: existingContacts[0]
      };
    }

    const newContact = await db.userContact.create({
      data: {
        userWallet,
        contactWallet,
        contactName,
        contactType,
        isActive: true,
        tags,
        notes,
        createdAt: new Date(),
        lastInteraction: new Date()
      }
    });

    console.log(`✅ Contact added successfully:`, newContact);
    
    return {
      success: true,
      message: `Contact ${contactName} added successfully`,
      contact: newContact
    };

  } catch (error: any) {
    console.error("❌ Error adding contact:", error);
    return {
      success: false,
      message: `Failed to add contact: ${error?.message || error}`,
      error: error?.message || error
    };
  }
}

export async function getContacts(userWallet: string): Promise<any> {
  try {
    console.log(`📋 Fetching contacts for user: ${userWallet}`);
    
    const contacts = await db.userContact.findMany({
      where: {
        userWallet: userWallet,
        isActive: true
      },
      orderBy: {
        lastInteraction: 'desc'
      }
    });

    console.log(`✅ Found ${contacts?.length || 0} contacts for user`);
    
    return {
      success: true,
      message: `Found ${contacts?.length || 0} contacts`,
      contacts: contacts || [],
      totalContacts: contacts?.length || 0
    };

  } catch (error: any) {
    console.error("❌ Error fetching contacts:", error);
    return {
      success: false,
      message: `Failed to fetch contacts: ${error?.message || error}`,
      contacts: [],
      error: error?.message || error
    };
  }
}

export async function updateContact(
  contactId: number,
  updates: Partial<Contact>
): Promise<any> {
  try {
    console.log(`✏️ Updating contact ID: ${contactId} with:`, updates);
    
    const updatedContact = await db.userContact.update({
      where: { id: contactId },
      data: {
        ...updates,
        lastInteraction: new Date()
      }
    });

    console.log(`✅ Contact updated successfully:`, updatedContact);
    
    return {
      success: true,
      message: "Contact updated successfully",
      contact: updatedContact
    };

  } catch (error: any) {
    console.error("❌ Error updating contact:", error);
    return {
      success: false,
      message: `Failed to update contact: ${error?.message || error}`,
      error: error?.message || error
    };
  }
}

export async function removeContact(contactId: number): Promise<any> {
  try {
    console.log(`🗑️ Removing contact ID: ${contactId}`);
    
    // Soft delete by setting isActive to false
    const removedContact = await db.userContact.update({
      where: { id: contactId },
      data: {
        isActive: false,
        lastInteraction: new Date()
      }
    });

    console.log(`✅ Contact removed successfully:`, removedContact);
    
    return {
      success: true,
      message: "Contact removed successfully",
      contact: removedContact
    };

  } catch (error: any) {
    console.error("❌ Error removing contact:", error);
    return {
      success: false,
      message: `Failed to remove contact: ${error?.message || error}`,
      error: error?.message || error
    };
  }
}

export async function searchContacts(
  userWallet: string,
  searchTerm: string
): Promise<any> {
  try {
    console.log(`🔍 Searching contacts for user: ${userWallet} with term: ${searchTerm}`);
    
    const contacts = await db.userContact.findMany({
      where: {
        userWallet: userWallet,
        isActive: true,
        OR: [
          { contactName: { contains: searchTerm, mode: 'insensitive' } },
          { contactWallet: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { hasSome: [searchTerm.toLowerCase()] } }
        ]
      },
      orderBy: {
        lastInteraction: 'desc'
      }
    });

    console.log(`✅ Found ${contacts?.length || 0} matching contacts`);
    
    return {
      success: true,
      message: `Found ${contacts?.length || 0} matching contacts`,
      contacts: contacts || [],
      searchTerm
    };

  } catch (error: any) {
    console.error("❌ Error searching contacts:", error);
    return {
      success: false,
      message: `Failed to search contacts: ${error?.message || error}`,
      contacts: [],
      error: error?.message || error
    };
  }
}

export async function getContactByWallet(
  userWallet: string,
  contactWallet: string
): Promise<any> {
  try {
    console.log(`🔍 Looking for contact with wallet: ${contactWallet} for user: ${userWallet}`);
    
    const contacts = await db.userContact.findMany({
      where: {
        userWallet: userWallet,
        contactWallet: contactWallet,
        isActive: true
      }
    });

    const contact = contacts && contacts.length > 0 ? contacts[0] : null;

    if (contact) {
      console.log(`✅ Contact found:`, contact);
      return {
        success: true,
        message: "Contact found",
        contact
      };
    } else {
      console.log(`❌ No contact found with wallet: ${contactWallet}`);
      return {
        success: false,
        message: `No contact found with wallet: ${contactWallet}`,
        contact: null
      };
    }

  } catch (error: any) {
    console.error("❌ Error finding contact:", error);
    return {
      success: false,
      message: `Failed to find contact: ${error?.message || error}`,
      contact: null,
      error: error?.message || error
    };
  }
}