/**
 * Authentication and User Management Service
 * Manages User Accounts, Roles (Admin, User), Passwords, and Role-Based Access Control (RBAC).
 */

export type UserRole = 'Admin' | 'User';

export interface UserAccount {
  id: string;
  adminName: string;   // Name / Admin label (e.g. លោក ហៀង តារា, គណនីសិស្ស)
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

const STORAGE_KEY_USERS = 'sms_user_accounts_v1';
const STORAGE_KEY_CURRENT_USER = 'sms_current_user_v1';
const AUTH_EVENT_NAME = 'sms_auth_state_changed';

// Backwards-compatible Admin PIN Management
const STORAGE_KEY_ADMIN_PIN = 'sms_admin_pin_v1';
const STORAGE_KEY_ADMIN_AUTH = 'sms_admin_authenticated_session';
const DEFAULT_PIN = '1234';

// Default Accounts specified by user:
// 1. Username: Hdara, Password: 8892 -> Admin
// 2. Username: lising, Password: lising -> User
const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-admin-1',
    adminName: 'លោក ហៀង តារា (Admin)',
    username: 'Hdara',
    password: '8892',
    role: 'Admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-student-2',
    adminName: 'សិស្សចុះឈ្មោះ (Student)',
    username: 'lising',
    password: 'lising',
    role: 'User',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

class AuthService {
  private users: UserAccount[] = [];
  private currentUser: UserAccount | null = null;
  private syncRemoteHandler?: ((users: UserAccount[]) => void) | null;

  constructor() {
    this.init();
  }

  /**
   * Set remote sync handler to sync accounts with Google Sheets
   */
  public setRemoteSyncHandler(handler: ((users: UserAccount[]) => void) | null): void {
    this.syncRemoteHandler = handler;
  }

  /**
   * Update accounts from Google Sheets
   */
  public setUsersFromRemote(remoteUsers: UserAccount[]): void {
    if (!Array.isArray(remoteUsers) || remoteUsers.length === 0) return;
    
    // Deduplicate by username case-insensitively
    const uniqueMap = new Map<string, UserAccount>();
    for (const u of remoteUsers) {
      if (!u || !u.username) continue;
      const key = u.username.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, u);
      }
    }

    // Ensure Hdara (Admin) exists
    if (!uniqueMap.has('hdara')) {
      uniqueMap.set('hdara', DEFAULT_USERS[0]);
    }

    // Ensure lising (User / Student) exists
    if (!uniqueMap.has('lising') && !uniqueMap.has('student')) {
      uniqueMap.set('lising', DEFAULT_USERS[1]);
    }

    const cleanUsers = Array.from(uniqueMap.values());
    const hadDuplicates = cleanUsers.length !== remoteUsers.length;
    this.users = cleanUsers;
    this.persistUsers(!hadDuplicates);
    this.notify();
  }

  private init() {
    // Load users from localStorage
    let rawList: UserAccount[] = [];
    const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawList = parsed;
        } else {
          rawList = [...DEFAULT_USERS];
        }
      } catch {
        rawList = [...DEFAULT_USERS];
      }
    } else {
      rawList = [...DEFAULT_USERS];
    }

    // Deduplicate by username case-insensitively (immediately purges any repeated 'lising' accounts)
    const uniqueMap = new Map<string, UserAccount>();
    for (const u of rawList) {
      if (!u || !u.username) continue;
      const key = u.username.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, u);
      }
    }

    // Ensure Hdara (Admin) exists
    if (!uniqueMap.has('hdara')) {
      uniqueMap.set('hdara', DEFAULT_USERS[0]);
    }

    // Ensure lising (User / Student) exists
    if (!uniqueMap.has('lising') && !uniqueMap.has('student')) {
      uniqueMap.set('lising', DEFAULT_USERS[1]);
    }

    this.users = Array.from(uniqueMap.values());
    this.persistUsers(true);

    // Load active session:
    // If user closed the tab/browser or clicked away without logging out,
    // sessionStorage is naturally cleared so reopening the link strictly requires entering Username & Password!
    const sessionUser = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY_CURRENT_USER) : null;
    if (sessionUser) {
      try {
        const parsedCurrent = JSON.parse(sessionUser);
        const matched = this.users.find(u => u.id === parsedCurrent.id || u.username.toLowerCase() === parsedCurrent.username?.toLowerCase());
        this.currentUser = matched || null;
      } catch {
        this.currentUser = null;
      }
    } else {
      // Protect Access: Strictly enforce Login screen for new sessions and link openings
      this.currentUser = null;
    }

    // Cross-tab and cross-window sync within the same browser
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_USERS && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.users = parsed;
              this.notify();
            }
          } catch {}
        }
        if (e.key === STORAGE_KEY_CURRENT_USER) {
          try {
            this.currentUser = e.newValue ? JSON.parse(e.newValue) : null;
            this.notify();
          } catch {}
        }
      });
    }
  }

  private persistUsers(skipRemote = false) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
    if (!skipRemote && this.syncRemoteHandler) {
      try {
        this.syncRemoteHandler(this.users);
      } catch (e) {
        console.warn('Error syncing users to remote:', e);
      }
    }
  }

  private persistCurrentUser() {
    if (this.currentUser) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
      }
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
    } else {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }

  private notify() {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, {
      detail: {
        currentUser: this.currentUser,
        users: this.users,
      }
    }));
  }

  public subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(AUTH_EVENT_NAME, handler);
    return () => window.removeEventListener(AUTH_EVENT_NAME, handler);
  }

  public getUsers(): UserAccount[] {
    return [...this.users];
  }

  public getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  public isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  public isUser(): boolean {
    return this.currentUser?.role === 'User';
  }

  /**
   * Get the primary Student / User account to pre-fill on login form
   */
  public getDefaultStudentAccount(): UserAccount {
    const studentUser = this.users.find(u => u.role === 'User') 
      || this.users.find(u => u.username.toLowerCase() === 'student') 
      || DEFAULT_USERS[1];
    return studentUser;
  }

  /**
   * Get the primary Admin account
   */
  public getPrimaryAdminAccount(): UserAccount {
    const adminUser = this.users.find(u => u.role === 'Admin') 
      || this.users.find(u => u.username.toLowerCase() === 'hdara') 
      || DEFAULT_USERS[0];
    return adminUser;
  }

  // --- Backwards compatibility for Admin PIN actions (Schools / Majors catalog) ---
  public getAdminPin(): string {
    return localStorage.getItem(STORAGE_KEY_ADMIN_PIN) || DEFAULT_PIN;
  }

  public isAdminAuthenticated(): boolean {
    if (this.isAdmin()) return true;
    return sessionStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
  }

  public verifyPin(pin: string): boolean {
    const currentPin = this.getAdminPin();
    if (pin.trim() === currentPin.trim()) {
      sessionStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { isAdmin: true } }));
      return true;
    }
    return false;
  }

  public changePin(currentPin: string, newPin: string): { success: boolean; message: string } {
    if (!this.verifyPin(currentPin)) {
      return { success: false, message: 'លេខកូដចាស់មិនត្រឹមត្រូវទេ (Incorrect current PIN)' };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'លេខកូដថ្មីត្រូវមានយ៉ាងតិច ៤ ខ្ទង់ (New PIN must be at least 4 digits)' };
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_PIN, newPin.trim());
    return { success: true, message: 'បានប្តូរលេខកូដសម្ងាត់ជោគជ័យ (PIN changed successfully)' };
  }

  public logoutAdmin(): void {
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { isAdmin: false } }));
  }

  public resetPinToDefault(): void {
    localStorage.removeItem(STORAGE_KEY_ADMIN_PIN);
  }

  /**
   * Login with username and password
   */
  public login(username: string, password: string): { success: boolean; message: string; user?: UserAccount } {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, message: 'សូមបញ្ចូល Username និង Password (Please enter Username and Password)' };
    }

    const matched = this.users.find(
      u => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === trimmedPass
    );

    if (!matched) {
      return { success: false, message: 'Username ឬ Password មិនត្រឹមត្រូវទេ (Invalid Username or Password)' };
    }

    this.currentUser = matched;
    this.persistCurrentUser();
    this.notify();

    return {
      success: true,
      message: `ចូលប្រើប្រាស់ជោគជ័យក្នុងនាមជា ${matched.role} (${matched.adminName})`,
      user: matched,
    };
  }

  /**
   * Logout current user
   */
  public logout(): void {
    this.currentUser = null;
    this.persistCurrentUser();
    this.notify();
  }

  /**
   * Set active user directly (only for valid users)
   */
  public switchUser(userId: string): { success: boolean; message: string } {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'រកមិនឃើញគណនី (User not found)' };
    }
    this.currentUser = user;
    this.persistCurrentUser();
    this.notify();
    return { success: true, message: `ប្តូរទៅគណនី ${user.username} ជោគជ័យ` };
  }

  /**
   * Add new user account (Admin only)
   */
  public addUser(data: { adminName: string; username: string; password: string; role: UserRole }): { success: boolean; message: string; user?: UserAccount } {
    const trimmedUser = data.username.trim();
    const trimmedPass = data.password.trim();
    const trimmedName = data.adminName.trim() || trimmedUser;

    if (!trimmedUser || !trimmedPass) {
      return { success: false, message: 'Username និង Password មិនអាចទុកទទេបានទេ' };
    }

    if (this.users.some(u => u.username.toLowerCase() === trimmedUser.toLowerCase())) {
      return { success: false, message: `Username "${trimmedUser}" មានរួចហើយ សូមជ្រើសរើសឈ្មោះផ្សេង` };
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      adminName: trimmedName,
      username: trimmedUser,
      password: trimmedPass,
      role: data.role,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.persistUsers();
    this.notify();

    return { success: true, message: 'បានបង្កើតគណនីថ្មីជោគជ័យ (User created successfully)', user: newUser };
  }

  /**
   * Update existing user account (Admin only)
   */
  public updateUser(id: string, updates: Partial<UserAccount>): { success: boolean; message: string } {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'រកមិនឃើញគណនីដើម្បីកែប្រែ' };
    }

    // Check username uniqueness if changed
    if (updates.username) {
      const trimmedUser = updates.username.trim();
      const duplicate = this.users.some((u, i) => i !== index && u.username.toLowerCase() === trimmedUser.toLowerCase());
      if (duplicate) {
        return { success: false, message: `Username "${trimmedUser}" ត្រូវបានប្រើប្រាស់រួចហើយ` };
      }
      updates.username = trimmedUser;
    }

    // Ensure Hdara cannot lose Admin role
    if (this.users[index].username.toLowerCase() === 'hdara' && updates.role && updates.role !== 'Admin') {
      return { success: false, message: 'គណនីមេ Hdara មិនអាចផ្លាស់ប្តូរសិទ្ធិពី Admin បានទេ' };
    }

    this.users[index] = {
      ...this.users[index],
      ...updates,
    };

    // If current logged-in user is updated, update currentUser
    if (this.currentUser?.id === id) {
      this.currentUser = { ...this.users[index] };
      this.persistCurrentUser();
    }

    this.persistUsers();
    this.notify();
    return { success: true, message: 'បានកែប្រែព័ត៌មានគណនីជោគជ័យ (User updated successfully)' };
  }

  /**
   * Delete user account (Admin only, cannot delete Hdara)
   */
  public deleteUser(id: string): { success: boolean; message: string } {
    const target = this.users.find(u => u.id === id);
    if (!target) {
      return { success: false, message: 'រកមិនឃើញគណនី' };
    }

    if (target.username.toLowerCase() === 'hdara') {
      return { success: false, message: 'មិនអាចលុបគណនីចម្បង Hdara (Admin) បានឡើយ!' };
    }

    if (this.currentUser?.id === id) {
      return { success: false, message: 'មិនអាចលុបគណនីដែលកំពុងដំណើរការផ្ទាល់ខ្លួនបានទេ សូមប្តូរគណនីជាមុនសិន' };
    }

    this.users = this.users.filter(u => u.id !== id);
    this.persistUsers();
    this.notify();

    return { success: true, message: 'បានលុបគណនីជោគជ័យ (User deleted successfully)' };
  }
}

export const authService = new AuthService();
