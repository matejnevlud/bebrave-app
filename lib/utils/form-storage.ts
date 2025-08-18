// Form data storage utility using localStorage
export interface ReservationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod?: string;
  // Invoice address fields
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

const FORM_STORAGE_KEY = "bebrave-reservation-form";

export class FormStorage {
  /**
   * Save form data to localStorage
   */
  static saveFormData(data: ReservationFormData): void {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save form data to localStorage:", error);
    }
  }

  /**
   * Load form data from localStorage
   */
  static loadFormData(): ReservationFormData | null {
    try {
      const stored = localStorage.getItem(FORM_STORAGE_KEY);

      if (stored) {
        return JSON.parse(stored) as ReservationFormData;
      }
    } catch (error) {
      console.warn("Failed to load form data from localStorage:", error);
    }

    return null;
  }

  /**
   * Clear form data from localStorage
   */
  static clearFormData(): void {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear form data from localStorage:", error);
    }
  }

  /**
   * Save individual field to localStorage
   */
  static saveField(field: keyof ReservationFormData, value: string): void {
    const currentData = this.loadFormData() || ({} as ReservationFormData);

    currentData[field] = value;
    this.saveFormData(currentData);
  }

  /**
   * Get individual field from localStorage
   */
  static getField(field: keyof ReservationFormData): string {
    const data = this.loadFormData();

    return data?.[field] || "";
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__";

      localStorage.setItem(test, test);
      localStorage.removeItem(test);

      return true;
    } catch {
      return false;
    }
  }
}
