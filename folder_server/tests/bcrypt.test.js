const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const bcrypt = require('bcryptjs');

// Mock bcryptjs
jest.mock('bcryptjs');

describe('Bcrypt Helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', () => {
      const mockSalt = 'mockedsalt';
      const mockHash = 'mockedhashedpassword';
      
      bcrypt.genSaltSync.mockReturnValue(mockSalt);
      bcrypt.hashSync.mockReturnValue(mockHash);

      const result = hashPassword('password123');

      expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
      expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', mockSalt);
      expect(result).toBe(mockHash);
    });

    it('should handle different passwords', () => {
      const passwords = ['test123', 'another', 'complex!@#$'];
      
      bcrypt.genSaltSync.mockReturnValue('salt');
      bcrypt.hashSync.mockReturnValue('hash');

      passwords.forEach(password => {
        hashPassword(password);
        expect(bcrypt.hashSync).toHaveBeenCalledWith(password, 'salt');
      });
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', () => {
      bcrypt.compareSync.mockReturnValue(true);

      const result = comparePassword('password123', 'hashedpassword');

      expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', () => {
      bcrypt.compareSync.mockReturnValue(false);

      const result = comparePassword('wrongpassword', 'hashedpassword');

      expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(result).toBe(false);
    });

    it('should handle empty passwords', () => {
      bcrypt.compareSync.mockReturnValue(false);

      const result = comparePassword('', 'hashedpassword');

      expect(bcrypt.compareSync).toHaveBeenCalledWith('', 'hashedpassword');
      expect(result).toBe(false);
    });
  });
});
