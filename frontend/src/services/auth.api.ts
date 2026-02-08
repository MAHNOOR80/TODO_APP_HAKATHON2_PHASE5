import { api } from './api';

/**
 * Authentication API Client
 * Functions for signup, signin, and signout
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupRequest): Promise<User> {
  return api.post<User>('/auth/signup', data);
}

/**
 * Sign in existing user
 */
export async function signin(data: SigninRequest): Promise<User> {
  return api.post<User>('/auth/signin', data);
}

/**
 * Sign out current user
 */
export async function signout(): Promise<void> {
  await api.post<void>('/auth/signout');
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<User> {
  return api.get<User>('/auth/me');
}
