import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../components/Login';
import { AuthContext } from '../context/AuthContext';

describe('Login Component', () => {
  let mockLogin;
  let mockNavigate;

  beforeEach(() => {
    mockLogin = vi.fn();
    mockNavigate = vi.fn();

    // Mock the useAuth hook
    vi.mock('../context/useAuth', () => ({
      useAuth: () => ({
        login: mockLogin,
        loading: false,
        error: null,
      }),
    }));

    // Mock useNavigate
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));
  });

  it('should render login form with email and password fields', () => {
    render(<Login />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should allow user to input email and password', async () => {
    render(<Login />);
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should display validation error for empty fields', async () => {
    render(<Login />);
    const user = userEvent.setup();

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Check if error message appears
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should display validation error for invalid email format', async () => {
    render(<Login />);
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should call login function with correct credentials', async () => {
    render(<Login />);
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should have link to register page', () => {
    render(<Login />);

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
