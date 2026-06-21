declare global {
  namespace App {
    interface Locals {
      locale: string;
      admin?: { email: string };
    }
  }
}

export {};
