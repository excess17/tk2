import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { apiNodiPost } from 'api/nodis';
import NodiAddFormContainer from 'components/NodiAddFormContainer';
import 'i18n/__mocks__/i18nMock';
import { nodiMockAdd as nodiMock } from 'components/__mocks__/nodiMocks';

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
jest.mock('@material-ui/pickers', () => {
  // eslint-disable-next-line react/prop-types
  const MockPicker = ({ id, value, name, label, onChange }) => {
    const handleChange = (event) => onChange(event.currentTarget.value);
    return (
      <span>
        <label htmlFor={id}>{label}</label>
        <input id={id} name={name} value={value || ''} onChange={handleChange} />
      </span>
    );
  };
  return {
    ...jest.requireActual('@material-ui/pickers'),
    DateTimePicker: MockPicker,
    DatePicker: MockPicker,
  };
});

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

describe('NodiAddFormContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const errorMessageKey = 'error.dataLoading';
  const successMessageKey = 'common.dataSaved';

  const onErrorMock = jest.fn();
  const onCreateMock = jest.fn();

  it('saves data', async () => {
    apiNodiPost.mockImplementation((data) => Promise.resolve(data));

    const { findByTestId, findByLabelText, queryByText, rerender } = render(
      <NodiAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />
    );

    const field1Field = await findByLabelText('entities.nodi.field1');
    fireEvent.change(field1Field, { target: { value: nodiMock.field1 } });
    rerender(
      <NodiAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />
    );

    const saveButton = await findByTestId('submit-btn');

    fireEvent.click(saveButton);

    await wait(() => {
      expect(apiNodiPost).toHaveBeenCalledTimes(1);
      expect(apiNodiPost).toHaveBeenCalledWith('', nodiMock);

      expect(queryByText(successMessageKey)).toBeInTheDocument();

      expect(onErrorMock).toHaveBeenCalledTimes(0);
      expect(queryByText(errorMessageKey)).not.toBeInTheDocument();
    });
  }, 7000);

  it('shows an error if data is not successfully saved', async () => {
    apiNodiPost.mockImplementation(() => Promise.reject());

    const { findByTestId, findByLabelText, queryByText, rerender } = render(
      <NodiAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />
    );

    const field1Field = await findByLabelText('entities.nodi.field1');
    fireEvent.change(field1Field, { target: { value: nodiMock.field1 } });
    rerender(
      <NodiAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />
    );

    const saveButton = await findByTestId('submit-btn');

    fireEvent.click(saveButton);

    await wait(() => {
      expect(apiNodiPost).toHaveBeenCalledTimes(1);
      expect(apiNodiPost).toHaveBeenCalledWith('', nodiMock);

      expect(queryByText(successMessageKey)).not.toBeInTheDocument();

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(queryByText(errorMessageKey)).toBeInTheDocument();
    });
  }, 7000);
});
