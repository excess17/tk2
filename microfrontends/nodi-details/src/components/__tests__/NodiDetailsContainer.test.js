import React from 'react';
import { render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import 'components/__mocks__/i18n';
import { apiNodiGet } from 'api/nodi';
import nodiApiGetResponseMock from 'components/__mocks__/nodiMocks';
import NodiDetailsContainer from 'components/NodiDetailsContainer';

jest.mock('api/nodi');

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

beforeEach(() => {
  apiNodiGet.mockClear();
});

describe('NodiDetailsContainer component', () => {
  test('requests data when component is mounted', async () => {
    apiNodiGet.mockImplementation(() => Promise.resolve(nodiApiGetResponseMock));

    render(<NodiDetailsContainer id="1" />);

    await wait(() => {
      expect(apiNodiGet).toHaveBeenCalledTimes(1);
    });
  });

  test('data is shown after mount API call', async () => {
    apiNodiGet.mockImplementation(() => Promise.resolve(nodiApiGetResponseMock));

    const { getByText } = render(<NodiDetailsContainer id="1" />);

    await wait(() => {
      expect(apiNodiGet).toHaveBeenCalledTimes(1);
      expect(getByText('entities.nodi.id')).toBeInTheDocument();
      expect(getByText('entities.nodi.field1')).toBeInTheDocument();
    });
  });

  test('error is shown after failed API call', async () => {
    const onErrorMock = jest.fn();
    apiNodiGet.mockImplementation(() => Promise.reject());

    const { getByText } = render(<NodiDetailsContainer id="1" onError={onErrorMock} />);

    await wait(() => {
      expect(apiNodiGet).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(getByText('error.dataLoading')).toBeInTheDocument();
    });
  });
});
