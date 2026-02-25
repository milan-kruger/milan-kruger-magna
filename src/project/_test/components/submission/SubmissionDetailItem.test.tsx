import { render, screen } from '@testing-library/react';
import { SvgIcon } from '@mui/material';
import SubmissionDetailItem from '../../../components/submission/SubmissionDetailItem';

// Mock the `toCamelCaseWords` util
vi.mock('../../../../framework/utils', async () => {
    return {
        toCamelCaseWords: (base: string, suffix?: string, index?: string) => {
            return [base, suffix, index].filter(Boolean).join('-');
        }
    };
});

describe('SubmissionDetailItem', () => {
    const baseProps = {
        testId: 'testIdValue',
        label: 'Test Label',
        values: ['Alpha', 'Beta'],
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders the label with correct id and text', () => {
        render(<SubmissionDetailItem {...baseProps} />);
        const labelElement = screen.getByText('Test Label');
        expect(labelElement).toBeInTheDocument();
        expect(labelElement.id).toBe('testIdValue-Label');
    });

    it('renders each value with correct id and content', () => {
        render(<SubmissionDetailItem {...baseProps} />);
        baseProps.values.forEach((value, index) => {
            const valueElement = screen.getByText(value);
            expect(valueElement).toBeInTheDocument();
            expect(valueElement.id).toBe(`testIdValue-Value-${index}`);
        });
    });

    it('renders the icon if provided, one per value', () => {
        const MockIcon = () => <SvgIcon data-testid="mock-icon" />;
        render(
            <SubmissionDetailItem
                {...baseProps}
                icon={<MockIcon />}
            />
        );
        const icons = screen.getAllByTestId('mock-icon');
        expect(icons).toHaveLength(baseProps.values.length);
    });
});
