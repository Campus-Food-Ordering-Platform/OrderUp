import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VendorProfile from './VendorProfile';

// ---------------------------------------------------------------------------
// Global stubs
// ---------------------------------------------------------------------------

// jsdom doesn't implement URL.createObjectURL
beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // alert() is used on save success/failure
  vi.spyOn(window, 'alert').mockImplementation(() => {});

  // Silence console noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fill in the minimum fields required to pass validateForm()
 * and upload one certificate so the certificate check passes.
 */
function fillMinimumValidForm() {
  // Use fireEvent (synchronous) so this helper works with both real and fake timers.
  fireEvent.change(screen.getByPlaceholderText('Business Name *'), { target: { value: 'Test Bakery' } });
  fireEvent.change(screen.getByPlaceholderText('Email Address *'), { target: { value: 'test@bakery.com' } });
  fireEvent.change(screen.getByPlaceholderText('Phone Number *'), { target: { value: '09171234567' } });
  fireEvent.change(screen.getByPlaceholderText('Full Address *'), { target: { value: '123 Main St' } });

  // Upload a business permit certificate
  const file = new File(['dummy'], 'permit.pdf', { type: 'application/pdf' });
  const fileInputs = document.querySelectorAll('input[type="file"]');
  // First file input is the profile image; next is business permit
  fireEvent.change(fileInputs[1], { target: { files: [file] } });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VendorProfile', () => {

  // ── Static rendering ──────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders the page heading', () => {
      render(<VendorProfile />);
      expect(screen.getByText('Vendor Profile')).toBeInTheDocument();
    });

    it('renders all major section headings', () => {
      render(<VendorProfile />);
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Operating Hours')).toBeInTheDocument();
      expect(screen.getByText('Delivery Settings')).toBeInTheDocument();
      expect(screen.getByText('Accepted Payment Methods')).toBeInTheDocument();
      expect(screen.getByText('Bank Details for Payouts')).toBeInTheDocument();
      expect(screen.getByText('Online Presence')).toBeInTheDocument();
      expect(screen.getByText('Announcements')).toBeInTheDocument();
    });

    it('renders the certificates section with all four certificate labels', () => {
      render(<VendorProfile />);
      expect(screen.getByText(/Business Permit \/ Mayors Permit/)).toBeInTheDocument();
      expect(screen.getByText(/Sanitary Permit/)).toBeInTheDocument();
      expect(screen.getByText(/DTI \/ SEC Registration/)).toBeInTheDocument();
      expect(screen.getByText(/BIR Certificate of Registration/)).toBeInTheDocument();
    });

    it('renders the save button in idle state', () => {
      render(<VendorProfile />);
      expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
    });

    it('renders payment method checkboxes for all five methods', () => {
      render(<VendorProfile />);
      ['CASH', 'CARD', 'GCASH', 'PAYMAYA', 'BANK TRANSFER'].forEach(label => {
        expect(screen.getByRole('checkbox', { name: label })).toBeInTheDocument();
      });
    });

    it('shows the profile image upload placeholder initially', () => {
      render(<VendorProfile />);
      // The placeholder is a <span> with the exact text "📸 Upload".
      // /upload/i also matches the <small> subtitle, so use exact string.
      expect(screen.getByText('📸 Upload')).toBeInTheDocument();
    });

    it('does NOT show the preview section when businessName is empty', () => {
      render(<VendorProfile />);
      expect(screen.queryByText('Preview:')).not.toBeInTheDocument();
    });
  });

  // ── Form field interactions ───────────────────────────────────────────────

  describe('form field interactions', () => {
    it('updates businessName field', async () => {
      render(<VendorProfile />);
      const input = screen.getByPlaceholderText('Business Name *');
      await userEvent.type(input, 'My Bakery');
      expect(input.value).toBe('My Bakery');
    });

    it('updates email field', async () => {
      render(<VendorProfile />);
      const input = screen.getByPlaceholderText('Email Address *');
      await userEvent.type(input, 'owner@mybakery.com');
      expect(input.value).toBe('owner@mybakery.com');
    });

    it('updates phone field', async () => {
      render(<VendorProfile />);
      const input = screen.getByPlaceholderText('Phone Number *');
      await userEvent.type(input, '09171234567');
      expect(input.value).toBe('09171234567');
    });

    it('updates address field', async () => {
      render(<VendorProfile />);
      const input = screen.getByPlaceholderText('Full Address *');
      await userEvent.type(input, '456 Rizal Ave');
      expect(input.value).toBe('456 Rizal Ave');
    });

    it('updates the slogan field', async () => {
      render(<VendorProfile />);
      const input = screen.getByPlaceholderText(/slogan/i);
      await userEvent.type(input, 'Fresh & Fast!');
      expect(input.value).toBe('Fresh & Fast!');
    });

    it('updates business type via select', async () => {
      render(<VendorProfile />);
      const select = screen.getByDisplayValue('Sole Proprietorship');
      fireEvent.change(select, { target: { value: 'partnership' } });
      expect(select.value).toBe('partnership');
    });

    it('updates operating hours time inputs', () => {
      render(<VendorProfile />);
      const [opening, closing] = screen.getAllByDisplayValue('');
      // time inputs start empty — grab by type
      const timeInputs = document.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '08:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '18:00' } });
      expect(timeInputs[0].value).toBe('08:00');
      expect(timeInputs[1].value).toBe('18:00');
    });

    it('updates the description textarea', async () => {
      render(<VendorProfile />);
      const textarea = screen.getByPlaceholderText(/Business Description/i);
      await userEvent.type(textarea, 'Artisan bread since 2010');
      expect(textarea.value).toBe('Artisan bread since 2010');
    });

    it('updates the special announcements textarea', async () => {
      render(<VendorProfile />);
      const textarea = screen.getByPlaceholderText(/special announcements/i);
      await userEvent.type(textarea, 'Closed on holidays');
      expect(textarea.value).toBe('Closed on holidays');
    });

    it('updates website, instagram and facebook fields', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Website URL'), 'https://mybakery.com');
      await userEvent.type(screen.getByPlaceholderText('Instagram Username'), '@mybakery');
      await userEvent.type(screen.getByPlaceholderText('Facebook Page'), 'MyBakeryPH');
      expect(screen.getByPlaceholderText('Website URL').value).toBe('https://mybakery.com');
      expect(screen.getByPlaceholderText('Instagram Username').value).toBe('@mybakery');
      expect(screen.getByPlaceholderText('Facebook Page').value).toBe('MyBakeryPH');
    });
  });

  // ── Preview section ───────────────────────────────────────────────────────

  describe('preview section', () => {
    it('appears once a business name is typed', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'Sunrise Cafe');
      expect(screen.getByText('Preview:')).toBeInTheDocument();
    });

    it('shows the business name in the preview', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'Sunrise Cafe');
      const preview = screen.getByText('Sunrise Cafe');
      expect(preview).toBeInTheDocument();
    });

    it('shows the slogan in the preview when provided', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'Sunrise Cafe');
      await userEvent.type(screen.getByPlaceholderText(/slogan/i), 'Good mornings!');
      expect(screen.getByText(/Good mornings!/)).toBeInTheDocument();
    });

    it('shows "No phone" when phone is empty', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'Sunrise Cafe');
      expect(screen.getByText(/No phone/)).toBeInTheDocument();
    });

    it('shows "No email" when email is empty', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'Sunrise Cafe');
      expect(screen.getByText(/No email/)).toBeInTheDocument();
    });

    it('shows "Bank details not set" when bankName is empty', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'Sunrise Cafe');
      expect(screen.getByText(/Bank details not set/)).toBeInTheDocument();
    });

    it('shows "Business permit uploaded" indicator in preview when cert is uploaded', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'Sunrise Cafe');
      const file = new File(['dummy'], 'permit.pdf', { type: 'application/pdf' });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fireEvent.change(fileInputs[1], { target: { files: [file] } });
      expect(screen.getByText(/Business permit uploaded/i)).toBeInTheDocument();
    });
  });

  // ── Payment method toggles ────────────────────────────────────────────────

  describe('payment method toggles', () => {
    it('checks a payment method when clicked', async () => {
      render(<VendorProfile />);
      const cashCheckbox = screen.getByRole('checkbox', { name: 'CASH' });
      expect(cashCheckbox).not.toBeChecked();
      await userEvent.click(cashCheckbox);
      expect(cashCheckbox).toBeChecked();
    });

    it('unchecks a payment method when clicked again', async () => {
      render(<VendorProfile />);
      const gcashCheckbox = screen.getByRole('checkbox', { name: 'GCASH' });
      await userEvent.click(gcashCheckbox);
      expect(gcashCheckbox).toBeChecked();
      await userEvent.click(gcashCheckbox);
      expect(gcashCheckbox).not.toBeChecked();
    });

    it('allows multiple payment methods to be selected simultaneously', async () => {
      render(<VendorProfile />);
      await userEvent.click(screen.getByRole('checkbox', { name: 'CASH' }));
      await userEvent.click(screen.getByRole('checkbox', { name: 'GCASH' }));
      await userEvent.click(screen.getByRole('checkbox', { name: 'CARD' }));
      expect(screen.getByRole('checkbox', { name: 'CASH' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'GCASH' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'CARD' })).toBeChecked();
    });
  });

  // ── Delivery settings conditional rendering ───────────────────────────────

  describe('delivery settings', () => {
    it('hides delivery-specific fields when delivery is off', () => {
      render(<VendorProfile />);
      expect(screen.queryByPlaceholderText(/Minimum Order Amount/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Maximum Delivery Radius/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Delivery Fee/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Free Delivery Threshold/i)).not.toBeInTheDocument();
    });

    it('shows delivery-specific fields when "I offer delivery service" is checked', async () => {
      render(<VendorProfile />);
      await userEvent.click(screen.getByRole('checkbox', { name: /I offer delivery service/i }));
      expect(screen.getByPlaceholderText(/Minimum Order Amount/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Maximum Delivery Radius/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Delivery Fee/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Free Delivery Threshold/i)).toBeInTheDocument();
    });

    it('hides delivery fields again when delivery checkbox is unchecked', async () => {
      render(<VendorProfile />);
      const checkbox = screen.getByRole('checkbox', { name: /I offer delivery service/i });
      await userEvent.click(checkbox);
      await userEvent.click(checkbox);
      expect(screen.queryByPlaceholderText(/Minimum Order Amount/i)).not.toBeInTheDocument();
    });
  });

  // ── Pre-order conditional rendering ──────────────────────────────────────

  describe('pre-order settings', () => {
    it('hides pre-order lead time input initially', () => {
      render(<VendorProfile />);
      expect(screen.queryByPlaceholderText(/Pre-order lead time/i)).not.toBeInTheDocument();
    });

    it('shows pre-order lead time input when "Accept pre-orders" is checked', async () => {
      render(<VendorProfile />);
      await userEvent.click(screen.getByRole('checkbox', { name: /Accept pre-orders/i }));
      expect(screen.getByPlaceholderText(/Pre-order lead time/i)).toBeInTheDocument();
    });

    it('hides pre-order lead time input when unchecked again', async () => {
      render(<VendorProfile />);
      const checkbox = screen.getByRole('checkbox', { name: /Accept pre-orders/i });
      await userEvent.click(checkbox);
      await userEvent.click(checkbox);
      expect(screen.queryByPlaceholderText(/Pre-order lead time/i)).not.toBeInTheDocument();
    });
  });

  // ── Certificate upload ────────────────────────────────────────────────────

  describe('certificate upload', () => {
    it('shows "Document uploaded" status after uploading a business permit', () => {
      render(<VendorProfile />);
      const file = new File(['content'], 'permit.pdf', { type: 'application/pdf' });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fireEvent.change(fileInputs[1], { target: { files: [file] } });
      expect(screen.getByText(/Document uploaded/i)).toBeInTheDocument();
    });

    it('shows a Remove button after uploading a business permit', () => {
      render(<VendorProfile />);
      const file = new File(['content'], 'permit.pdf', { type: 'application/pdf' });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fireEvent.change(fileInputs[1], { target: { files: [file] } });
      expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
    });

    it('removes the certificate when the Remove button is clicked', () => {
      render(<VendorProfile />);
      const file = new File(['content'], 'permit.pdf', { type: 'application/pdf' });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fireEvent.change(fileInputs[1], { target: { files: [file] } });

      fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
      expect(screen.queryByText(/Document uploaded/i)).not.toBeInTheDocument();
    });

    it('calls URL.createObjectURL when a certificate is uploaded', () => {
      render(<VendorProfile />);
      const file = new File(['x'], 'cert.png', { type: 'image/png' });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fireEvent.change(fileInputs[1], { target: { files: [file] } });
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });
  });

  // ── Profile image upload ──────────────────────────────────────────────────

  describe('profile image upload', () => {
    it('calls URL.createObjectURL when an image is selected', () => {
      render(<VendorProfile />);
      const file = new File(['img'], 'logo.png', { type: 'image/png' });
      const imgInput = document.getElementById('imgInput');
      fireEvent.change(imgInput, { target: { files: [file] } });
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('renders an <img> tag after a profile image is selected', () => {
      render(<VendorProfile />);
      const file = new File(['img'], 'logo.png', { type: 'image/png' });
      fireEvent.change(document.getElementById('imgInput'), { target: { files: [file] } });
      expect(screen.getByAltText('profile')).toBeInTheDocument();
    });
  });

  // ── Validation — required fields ──────────────────────────────────────────

  describe('form validation — required fields', () => {
    it('shows "Business name is required" error when businessName is empty', async () => {
      render(<VendorProfile />);
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Business name is required')).toBeInTheDocument()
      );
    });

    it('shows "Email is required" error when email is empty', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      );
    });

    it('shows "Phone number is required" error when phone is empty', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Phone number is required')).toBeInTheDocument()
      );
    });

    it('shows "Address is required" error when address is empty', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Address is required')).toBeInTheDocument()
      );
    });

    it('shows certificate error when no registration document is uploaded', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      await userEvent.type(screen.getByPlaceholderText('Full Address *'), '123 St');
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText(/at least one business registration document is required/i)).toBeInTheDocument()
      );
    });
  });

  // ── Validation — field formats ────────────────────────────────────────────

  describe('form validation — field formats', () => {
    it('shows "Email is invalid" for a malformed email', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'not-an-email');
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Email is invalid')).toBeInTheDocument()
      );
    });

    it('shows time error when closing time is before opening time', async () => {
      render(<VendorProfile />);
      const timeInputs = document.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '18:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '08:00' } });
      // Fill required fields so time validation is reached
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      await userEvent.type(screen.getByPlaceholderText('Full Address *'), '123 St');
      const file = new File(['x'], 'cert.pdf', { type: 'application/pdf' });
      fireEvent.change(document.querySelectorAll('input[type="file"]')[1], { target: { files: [file] } });
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Closing time must be after opening time')).toBeInTheDocument()
      );
    });

    it('passes time validation when closing time is after opening time', async () => {
      render(<VendorProfile />);
      const timeInputs = document.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '08:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '18:00' } });
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      await userEvent.type(screen.getByPlaceholderText('Full Address *'), '123 St');
      const file = new File(['x'], 'cert.pdf', { type: 'application/pdf' });
      fireEvent.change(document.querySelectorAll('input[type="file"]')[1], { target: { files: [file] } });
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.queryByText('Closing time must be after opening time')).not.toBeInTheDocument()
      );
    });
  });

  // ── Validation — delivery + bank details ─────────────────────────────────

  describe('form validation — delivery bank details', () => {
    it('requires bank name when delivery is enabled', async () => {
      render(<VendorProfile />);
      await userEvent.click(screen.getByRole('checkbox', { name: /I offer delivery service/i }));
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      await userEvent.type(screen.getByPlaceholderText('Full Address *'), '123 St');
      const file = new File(['x'], 'cert.pdf', { type: 'application/pdf' });
      fireEvent.change(document.querySelectorAll('input[type="file"]')[1], { target: { files: [file] } });
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Bank name is required for payouts')).toBeInTheDocument()
      );
    });

    it('requires account name when delivery is enabled', async () => {
      render(<VendorProfile />);
      await userEvent.click(screen.getByRole('checkbox', { name: /I offer delivery service/i }));
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      await userEvent.type(screen.getByPlaceholderText('Full Address *'), '123 St');
      const file = new File(['x'], 'cert.pdf', { type: 'application/pdf' });
      fireEvent.change(document.querySelectorAll('input[type="file"]')[1], { target: { files: [file] } });
      // Select a bank to clear that error; leave accountName empty
      fireEvent.change(screen.getByDisplayValue('Select Bank'), { target: { value: 'bdo' } });
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Account name is required')).toBeInTheDocument()
      );
    });

    it('requires account number when delivery is enabled', async () => {
      render(<VendorProfile />);
      await userEvent.click(screen.getByRole('checkbox', { name: /I offer delivery service/i }));
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      await userEvent.type(screen.getByPlaceholderText('Full Address *'), '123 St');
      const file = new File(['x'], 'cert.pdf', { type: 'application/pdf' });
      fireEvent.change(document.querySelectorAll('input[type="file"]')[1], { target: { files: [file] } });
      fireEvent.change(screen.getByDisplayValue('Select Bank'), { target: { value: 'bdo' } });
      await userEvent.type(screen.getByPlaceholderText('Account Name (as shown in bank)'), 'John Doe');
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText('Account number is required')).toBeInTheDocument()
      );
    });

    it('does NOT require bank details when delivery is disabled', async () => {
      render(<VendorProfile />);
      await userEvent.type(screen.getByPlaceholderText('Business Name *'), 'My Bakery');
      await userEvent.type(screen.getByPlaceholderText('Email Address *'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Phone Number *'), '09171234567');
      await userEvent.type(screen.getByPlaceholderText('Full Address *'), '123 St');
      const file = new File(['x'], 'cert.pdf', { type: 'application/pdf' });
      fireEvent.change(document.querySelectorAll('input[type="file"]')[1], { target: { files: [file] } });
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.queryByText('Bank name is required for payouts')).not.toBeInTheDocument()
      );
    });
  });

  // ── Certificate clears its own error ──────────────────────────────────────

  describe('certificate error clearing', () => {
    it('clears the certificate error on the next successful validation', async () => {
      render(<VendorProfile />);
      // Trigger validation without a certificate — error appears
      fireEvent.change(screen.getByPlaceholderText('Business Name *'), { target: { value: 'My Bakery' } });
      fireEvent.change(screen.getByPlaceholderText('Email Address *'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Phone Number *'), { target: { value: '09171234567' } });
      fireEvent.change(screen.getByPlaceholderText('Full Address *'), { target: { value: '123 St' } });
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText(/at least one business registration document/i)).toBeInTheDocument()
      );

      // Upload a certificate and attempt to save again — error clears on the
      // next validateForm() pass (the component only clears field-specific errors
      // inline; the general certificate error is cleared by re-running validation).
      const file = new File(['x'], 'cert.pdf', { type: 'application/pdf' });
      fireEvent.change(document.querySelectorAll('input[type="file"]')[1], { target: { files: [file] } });
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.queryByText(/at least one business registration document/i)).not.toBeInTheDocument()
      );
    });
  });

  // ── Save flow ─────────────────────────────────────────────────────────────

  describe('save flow', () => {
    it('disables the save button while saving', async () => {
      render(<VendorProfile />);
      fillMinimumValidForm();

      const btn = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(btn);

      // While the 2s simulated API call runs, the button should be disabled
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      );
    });

    it('shows "Saving and Uploading Documents..." while saving', async () => {
      render(<VendorProfile />);
      fillMinimumValidForm();
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      await waitFor(() =>
        expect(screen.getByText(/Saving and Uploading Documents/i)).toBeInTheDocument()
      );
    });

    it('calls alert with success message after a successful save', async () => {
      // Install fake timers BEFORE render so all internal setInterval/setTimeout
      // calls are controlled; restore in afterEach via vi.restoreAllMocks.
      vi.useFakeTimers();
      try {
        render(<VendorProfile />);
        // fillMinimumValidForm uses fireEvent (synchronous), safe with fake timers
        fillMinimumValidForm();
        fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
        // Advance past the simulated 2000ms API delay + upload progress intervals
        await vi.runAllTimersAsync();
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringMatching(/profile saved successfully/i)
        );
      } finally {
        vi.useRealTimers();
      }
    });

    it('does not proceed to save when validation fails', async () => {
      render(<VendorProfile />);
      // Click save without filling anything
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
      // Button label should NOT change to "Saving..."
      await waitFor(() =>
        expect(screen.queryByText(/Saving and Uploading/i)).not.toBeInTheDocument()
      );
    });
  });
});