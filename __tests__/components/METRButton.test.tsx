import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {METRButton} from '../../app/components/ui/METRButton';

describe('METRButton', () => {
  it('should render correctly', () => {
    const {getByText} = render(<METRButton title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const {getByText} = render(<METRButton title="Test" onPress={onPress} />);
    
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <METRButton title="Test" onPress={onPress} disabled={true} />
    );
    
    const button = getByText('Test').parent;
    expect(button?.props.disabled).toBe(true);
  });

  it('should render different variants', () => {
    const variants = ['primary', 'secondary', 'accent', 'ghost'] as const;
    
    variants.forEach(variant => {
      const {getByText} = render(
        <METRButton title="Test" onPress={() => {}} variant={variant} />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('should render different sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      const {getByText} = render(
        <METRButton title="Test" onPress={() => {}} size={size} />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });
});


