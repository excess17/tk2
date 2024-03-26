import React from 'react';
import { render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import nodiMocks from 'components/__mocks__/nodiMocks';
import { apiNodisGet } from 'api/nodis';
import 'i18n/__mocks__/i18nMock';
import NodiTableContainer from 'components/NodiTableContainer';

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

jest.mock('components/pagination/withPagination', () => {
  const withPagination = (Component) => {
    return (props) => (
      <Component
        {...props} // eslint-disable-line react/jsx-props-no-spreading
        pagination={{
          onChangeItemsPerPage: () => {},
          onChangeCurrentPage: () => {},
        }}
      />
    );
  };

  return withPagination;
});

describe('NodiTableContainer', () => {
  const errorMessageKey = 'error.dataLoading';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls API', async () => {
    apiNodisGet.mockImplementation(() => Promise.resolve({ nodis: nodiMocks, count: 2 }));
    const { queryByText } = render(<NodiTableContainer />);

    await wait(() => {
      expect(apiNodisGet).toHaveBeenCalledTimes(1);
      expect(queryByText(errorMessageKey)).not.toBeInTheDocument();
    });
  });

  it('shows an error if the API call is not successful', async () => {
    apiNodisGet.mockImplementation(() => {
      throw new Error();
    });
    const { getByText } = render(<NodiTableContainer />);

    wait(() => {
      expect(apiNodisGet).toHaveBeenCalledTimes(1);
      expect(getByText(errorMessageKey)).toBeInTheDocument();
    });
  });
});
