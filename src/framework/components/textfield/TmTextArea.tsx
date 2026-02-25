import { TextareaAutosize as BaseTextareaAutosize } from '@mui/material';
import { styled } from '@mui/system';
import { memo } from 'react';

type Props = {
    testId: string;
    minRows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TmTextArea = ({ testId, minRows, ...props }: Props) => {
    return (
        <TextArea
            id={testId}
            data-testid={testId}
            minRows={minRows ?? 10}
            maxRows={10}
            {...props}
        />
    );
}

const TextArea = styled(BaseTextareaAutosize)(
    ({ theme }) => `
        box-sizing: border-box;
        width: 100%;
        padding: 8px 12px;
        border-radius: 8px;
        resize: none;

        &:focus {
            border-color: ${theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark};
        }

        &:focus-visible {
            outline: 0;
        }
    `,
);

export default memo(TmTextArea);
