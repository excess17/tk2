import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import i18n from 'components/__mocks__/i18n';
import nodiMocks from 'components/__mocks__/nodiMocks';
import NodiTable from 'components/NodiTable';

describe('NodiTable', () => {
  it('shows nodis', () => {
    const { getByText } = render(<NodiTable items={nodiMocks} />);

    expect(getByText(nodiMocks[0].id.toString())).toBeInTheDocument();
    expect(getByText(nodiMocks[1].id.toString())).toBeInTheDocument();

    expect(getByText(nodiMocks[0].field1)).toBeInTheDocument();
    expect(getByText(nodiMocks[1].field1)).toBeInTheDocument();
  });

  it('shows no nodis message', () => {
    const { queryByText } = render(<NodiTable items={[]} />);

    expect(queryByText(nodiMocks[0].id.toString())).not.toBeInTheDocument();
    expect(queryByText(nodiMocks[1].id.toString())).not.toBeInTheDocument();

    expect(queryByText(nodiMocks[0].field1)).not.toBeInTheDocument();
    expect(queryByText(nodiMocks[1].field1)).not.toBeInTheDocument();

    expect(queryByText('entities.nodi.noItems')).toBeInTheDocument();
  });

  it('calls onSelect when the user clicks a table row', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(<NodiTable items={nodiMocks} onSelect={onSelectMock} />);

    fireEvent.click(getByText(nodiMocks[0].id.toString()));
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });
});
