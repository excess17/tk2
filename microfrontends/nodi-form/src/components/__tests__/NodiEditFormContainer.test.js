import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { apiNodiGet, apiNodiPut } from 'api/nodis';
import NodiEditFormContainer from 'components/NodiEditFormContainer';
import 'i18n/__mocks__/i18nMock';
import { nodiMockEdit as nodiMock } from 'components/__mocks__/nodiMocks';

const configMock = {
  systemParams: {
    api: {
      'nodi-api': {
        url: '',
      },
    },
  },
};

jest.mock('api/nodis');

jest.mock('auth/withKeycloak', () => {
  const withKeycloak = (Component) => {
    return (props) => (
      <Component
        {...props} // eslint-disable-line react/jsx-props-no-spreading
        keycloak={{
          initialized: true,
          authenticated: true,
        }}
      />
    );
  };

  return withKeycloak;
});

describe('NodiEditFormContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const errorMessageKey = 'error.dataLoading';
  const successMessageKey = 'common.dataSaved';

  const onErrorMock = jest.fn();
  const onUpdateMock = jest.fn();

  it('loads data', async () => {
    apiNodiGet.mockImplementation(() => Promise.resolve(nodiMock));
    const { queryByText } = render(
      <NodiEditFormContainer
        id="1"
        onError={onErrorMock}
        onUpdate={onUpdateMock}
        config={configMock}
      />
    );

    await wait(() => {
      expect(apiNodiGet).toHaveBeenCalledTimes(1);
      expect(apiNodiGet).toHaveBeenCalledWith('', '1');
      expect(queryByText(errorMessageKey)).not.toBeInTheDocument();
      expect(onErrorMock).toHaveBeenCalledTimes(0);
    });
  }, 7000);

  it('saves data', async () => {
    apiNodiGet.mockImplementation(() => Promise.resolve(nodiMock));
    apiNodiPut.mockImplementation(() => Promise.resolve(nodiMock));

    const { findByTestId, queryByText } = render(
      <NodiEditFormContainer
        id="1"
        onError={onErrorMock}
        onUpdate={onUpdateMock}
        config={configMock}
      />
    );

    const saveButton = await findByTestId('submit-btn');

    fireEvent.click(saveButton);

    await wait(() => {
      expect(apiNodiPut).toHaveBeenCalledTimes(1);
      expect(apiNodiPut).toHaveBeenCalledWith('', nodiMock.id, nodiMock);
      expect(queryByText(successMessageKey)).toBeInTheDocument();
      expect(onErrorMock).toHaveBeenCalledTimes(0);
      expect(queryByText(errorMessageKey)).not.toBeInTheDocument();
    });
  }, 7000);

  it('shows an error if data is not successfully loaded', async () => {
    apiNodiGet.mockImplementation(() => Promise.reject());
    const { queryByText } = render(
      <NodiEditFormContainer
        id="1"
        onError={onErrorMock}
        onUpdate={onUpdateMock}
        config={configMock}
      />
    );

    await wait(() => {
      expect(apiNodiGet).toHaveBeenCalledTimes(1);
      expect(apiNodiGet).toHaveBeenCalledWith('', '1');
      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(queryByText(errorMessageKey)).toBeInTheDocument();
      expect(queryByText(successMessageKey)).not.toBeInTheDocument();
    });
  }, 7000);

  it('shows an error if data is not successfully saved', async () => {
    apiNodiGet.mockImplementation(() => Promise.resolve(nodiMock));
    apiNodiPut.mockImplementation(() => Promise.reject());
    const { findByTestId, getByText } = render(
      <NodiEditFormContainer id="1" onError={onErrorMock} config={configMock} />
    );

    const saveButton = await findByTestId('submit-btn');

    fireEvent.click(saveButton);

    await wait(() => {
      expect(apiNodiGet).toHaveBeenCalledTimes(1);
      expect(apiNodiGet).toHaveBeenCalledWith('', '1');

      expect(apiNodiPut).toHaveBeenCalledTimes(1);
      expect(apiNodiPut).toHaveBeenCalledWith('', nodiMock.id, nodiMock);

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(getByText(errorMessageKey)).toBeInTheDocument();
    });
  }, 7000);
});
