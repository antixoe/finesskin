// 1. Add this import at the top of api.ts (adjust ../ based on where api.ts is located)
import { environment } from '../environments/environment';

// 2. Replace hardcoded 'http://localhost:3000' with environment.apiUrl
export class ApiService {
  private apiUrl = environment.apiUrl;

  // ... rest of your code
}