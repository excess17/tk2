import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import i18n from 'i18n/__mocks__/i18nMock';
import { nodiMockEdit as nodiMock } from 'components/__mocks__/nodiMocks';
import NodiForm from 'components/NodiForm';
import { createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme();

describe('Nodi Form', () => {
  it('shows form', () => {
    const { getByLabelText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <NodiForm nodi={nodiMock} />
      </ThemeProvider>
    );

    expect(getByTestId('nodi-id').value).toBe(nodiMock.id.toString());
    expect(getByLabelText('entities.nodi.field1').value).toBe(nodiMock.field1);
  });

  it('submits form', async () => {
    const handleSubmit = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <NodiForm nodi={nodiMock} onSubmit={handleSubmit} />
      </ThemeProvider>
    );

    const form = getByTestId('nodi-form');
    fireEvent.submit(form);

    await wait(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
