import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';

import 'components/__mocks__/i18n';
import NodiDetails from 'components/NodiDetails';
import nodiMock from 'components/__mocks__/nodiMocks';

describe('NodiDetails component', () => {
  test('renders data in details widget', () => {
    const { getByText } = render(<NodiDetails nodi={nodiMock} />);

    expect(getByText('entities.nodi.id')).toBeInTheDocument();
  });
});
