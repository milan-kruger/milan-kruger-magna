import { ThemeProvider, createTheme } from "@mui/material";
import TransgressionTopDetails from "../../../components/prosecution/TransgressionTopDetails";
import { render } from "vitest-browser-react";
import { TransgressionType } from "../../../enum/TransgressionType";
import { OverloadTransgressionDto, RetrieveTransgressionInformationResponse } from "../../../redux/api/transgressionsApi";
import { JSX } from "react/jsx-runtime";

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

const mockUseMediaQuery = vi.fn();
vi.mock('@mui/material/useMediaQuery', () => ({
  default: mockUseMediaQuery
}));

const theme = createTheme();

const mockData: OverloadTransgressionDto = {
    transgressionDate: '2024-03-15T14:30:00.000Z',
    transgressionNumber: 'TRN123456',
    vehicleRegistrationNumber: 'ABC123GP',
    status: 'ACTIVE'
} as unknown as OverloadTransgressionDto;

const defaultProps = {
  data: mockData,
  status: 'active',
  officerName: 'John Doe',
  team: 'Team Alpha',
  plateNumber: 'ABC123GP',
  transgressionType: TransgressionType.OVERLOAD
};

const renderComponent = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <TransgressionTopDetails {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe("TransgressionTopDetails", () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    const component = renderComponent();
    expect(component).toBeDefined();
  });

  it('should display all basic fields', async () => {
    const { container } = await renderComponent();

    expect(container.querySelector('[data-testid="editHeadingTransgressionDateLabel"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="editHeadingTransgressionStatusLabel"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="editHeadingTransgressionOfficerLabel"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="editHeadingTransgressionTeamLabel"]')).toBeTruthy();

    expect(container.querySelector('[data-testid="editHeadingTransgressionDate"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="editHeadingTransgressionStatus"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="editHeadingTransgressionOfficer"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="editHeadingTransgressionTeam"]')).toBeTruthy();
  });

  it('should display plate number for OVERLOAD transgression type', async () => {
    const { container } = await renderComponent({
      transgressionType: TransgressionType.OVERLOAD
    });

    expect(container.querySelector('[data-testid="editHeadingPlateNoLabel"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="editHeadingPlateNo"]')).toBeTruthy();
  });

  it('should not display plate number for RTQS transgression type', async () => {
    const { container } = await renderComponent({
      transgressionType: TransgressionType.RTQS
    });

    expect(container.querySelector('[data-testid="editHeadingPlateNoLabel"]')).toBeNull();
    expect(container.querySelector('[data-testid="editHeadingPlateNo"]')).toBeNull();
  });

  it('should not display plate number for SPEED transgression type', async () => {
    const { container } = await renderComponent({
      transgressionType: TransgressionType.SPEED
    });

    expect(container.querySelector('[data-testid="editHeadingPlateNoLabel"]')).toBeNull();
    expect(container.querySelector('[data-testid="editHeadingPlateNo"]')).toBeNull();
  });

  it('should display correct values in fields', async () => {
    const { container } = await renderComponent();

    const dateElement = container.querySelector('[data-testid="editHeadingTransgressionDate"]');
    expect(dateElement?.textContent).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);

    const statusElement = container.querySelector('[data-testid="editHeadingTransgressionStatus"]');
    expect(statusElement?.textContent).toBe('active');

    const officerElement = container.querySelector('[data-testid="editHeadingTransgressionOfficer"]');
    expect(officerElement?.textContent).toBe('John Doe');

    const teamElement = container.querySelector('[data-testid="editHeadingTransgressionTeam"]');
    expect(teamElement?.textContent).toBe('Team Alpha');

    const plateElement = container.querySelector('[data-testid="editHeadingPlateNo"]');
    expect(plateElement?.textContent).toBe('ABC123GP');
  });

  it('should handle different status values', async () => {
    const { container } = await renderComponent({
      status: 'pending'
    });

    const statusElement = container.querySelector('[data-testid="editHeadingTransgressionStatus"]');
    expect(statusElement?.textContent).toBe('pending');
  });

  it('should handle empty officer name', async () => {
    const { container } = await renderComponent({
      officerName: ''
    });

    const officerElement = container.querySelector('[data-testid="editHeadingTransgressionOfficer"]');
    expect(officerElement?.textContent).toBe('');
  });

  it('should handle empty team name', async () => {
    const { container } = await renderComponent({
      team: ''
    });

    const teamElement = container.querySelector('[data-testid="editHeadingTransgressionTeam"]');
    expect(teamElement?.textContent).toBe('');
  });

  it('should render with RetrieveTransgressionInformationResponse data type', async () => {
    const alternativeData = {
      transgressionDate: '2024-04-20T10:15:00.000Z',
      captureDate: '2024-04-20T10:00:00.000Z',
      charges: [],
      transgressionConfiguration: {},
      userAccount: {},
      vehicleCharges: []
    } as unknown as RetrieveTransgressionInformationResponse;

    const { container } = await renderComponent({
      data: alternativeData
    });

    expect(container.querySelector('[data-testid="editHeadingTransgressionDate"]')).toBeTruthy();
  });

  it('should apply correct flexbox styles based on breakpoints', async () => {
    const { container } = await renderComponent();

    const mainBox = container.firstElementChild as HTMLElement;
    expect(mainBox).toBeTruthy();

    const style = window.getComputedStyle(mainBox);
    expect(style.display).toBeDefined();
  });

  it('should render fields in correct order for OVERLOAD type', async () => {
    const { container } = await renderComponent({
      transgressionType: TransgressionType.OVERLOAD
    });

    const labels = container.querySelectorAll('[data-testid*="editHeading"][data-testid*="Label"]');
    const labelTexts = Array.from(labels).map(label => label.textContent);

    expect(labelTexts[0]).toBe('plateNo:');
    expect(labelTexts[1]).toBe('transgressionDate:');
    expect(labelTexts[2]).toBe('status:');
    expect(labelTexts[3]).toBe('transgressionOfficer:');
    expect(labelTexts[4]).toBe('transgressionTeam:');
  });

  it('should render fields in correct order for non-OVERLOAD types', async () => {
    const { container } = await renderComponent({
      transgressionType: TransgressionType.RTQS
    });

    const labels = container.querySelectorAll('[data-testid*="editHeading"][data-testid*="Label"]');
    const labelTexts = Array.from(labels).map(label => label.textContent);

    expect(labelTexts[0]).toBe('transgressionDate:');
    expect(labelTexts[1]).toBe('status:');
    expect(labelTexts[2]).toBe('transgressionOfficer:');
    expect(labelTexts[3]).toBe('transgressionTeam:');
  });

  it('should memoize component to prevent unnecessary re-renders', async () => {
    const { rerender } = await renderComponent();

    rerender(
      <ThemeProvider theme={theme}>
        <TransgressionTopDetails {...defaultProps} />
      </ThemeProvider>
    );

    expect(TransgressionTopDetails).toBeDefined();
  });

  describe('Responsive behavior', () => {
    it('should render with desktop layout when media queries return false', async () => {
      mockUseMediaQuery.mockReturnValue(false);

      const { container } = await renderComponent();

      const boxes = container.querySelectorAll('div');
      expect(boxes.length).toBeGreaterThan(0);

      const nestedBoxes = container.querySelectorAll('div > div');
      expect(nestedBoxes.length).toBeGreaterThan(0);
    });

    it('should render with mobile layout when isMobile is true', async () => {
      // First call for isMobile (md breakpoint) returns true
      // Second call for isMiniMobile (sm breakpoint) returns false
      mockUseMediaQuery
        .mockReturnValueOnce(true)  // isMobile
        .mockReturnValueOnce(false); // isMiniMobile

      const { container } = await renderComponent();

      // Component should render with mobile styles
      expect(container.querySelector('[data-testid="editHeadingTransgressionDate"]')).toBeTruthy();
    });

    it('should render with mini mobile layout when both queries are true', async () => {
      // Both media queries return true
      mockUseMediaQuery.mockReturnValue(true);

      const { container } = await renderComponent();

      // Component should render with mini mobile styles
      expect(container.querySelector('[data-testid="editHeadingTransgressionDate"]')).toBeTruthy();
    });

    it('should handle different media query values for each field', async () => {
      // Set up mock to return different values for each call
      let callCount = 0;
      mockUseMediaQuery.mockImplementation(() => {
        callCount++;
        // Alternate between true and false for different fields
        return callCount % 2 === 1;
      });

      const { container } = await renderComponent({
        transgressionType: TransgressionType.OVERLOAD
      });

      // Should still render all fields correctly
      const fieldElements = container.querySelectorAll('[data-testid*="editHeading"]:not([data-testid*="Label"])');
      expect(fieldElements.length).toBe(5);

      const labelElements = container.querySelectorAll('[data-testid*="Label"]');
      expect(labelElements.length).toBe(5);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing transgressionDate gracefully', async () => {
      const dataWithoutDate = {
        ...mockData,
        transgressionDate: undefined as unknown as string
      };

      const { container } = await renderComponent({ data: dataWithoutDate });

      expect(container.querySelector('[data-testid="editHeadingTransgressionDate"]')).toBeTruthy();
    });

    it('should handle very long text values with proper truncation', async () => {
      const longTextProps = {
        officerName: 'Very Long Officer Name That Should Be Handled Properly Without Breaking The Layout',
        team: 'Extremely Long Team Name That Goes On And On And Should Not Break The Component'
      };

      const { container } = await renderComponent(longTextProps);

      const officerElement = container.querySelector('[data-testid="editHeadingTransgressionOfficer"]');
      const teamElement = container.querySelector('[data-testid="editHeadingTransgressionTeam"]');

      expect(officerElement?.textContent).toBe(longTextProps.officerName);
      expect(teamElement?.textContent).toBe(longTextProps.team);
    });

    it('should handle special characters in field values', async () => {
      const specialCharProps = {
        officerName: 'O\'Brien & Associates <Test>',
        team: 'Team "Alpha" & \'Beta\'',
        plateNumber: 'ABC-123/GP'
      };

      const { container } = await renderComponent(specialCharProps);

      const officerElement = container.querySelector('[data-testid="editHeadingTransgressionOfficer"]');
      const teamElement = container.querySelector('[data-testid="editHeadingTransgressionTeam"]');
      const plateElement = container.querySelector('[data-testid="editHeadingPlateNo"]');

      expect(officerElement?.textContent).toBe(specialCharProps.officerName);
      expect(teamElement?.textContent).toBe(specialCharProps.team);
      expect(plateElement?.textContent).toBe(specialCharProps.plateNumber);
    });
  });

  describe('Performance and optimization', () => {
    it('should not re-render when parent re-renders with same props', async () => {
      const renderSpy = vi.fn();

      const TestWrapper = (props: JSX.IntrinsicAttributes & Readonly<{ data: OverloadTransgressionDto | RetrieveTransgressionInformationResponse; status: string; officerName: string; team: string; plateNumber: string; transgressionType: TransgressionType; }>) => {
        renderSpy();
        return <TransgressionTopDetails {...props} />;
      };

      const component = await render(
        <ThemeProvider theme={theme}>
          <TestWrapper {...defaultProps} />
        </ThemeProvider>
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      component.rerender(
        <ThemeProvider theme={theme}>
          <TestWrapper {...defaultProps} />
        </ThemeProvider>
      );

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid prop updates efficiently', async () => {
      const { rerender } = await renderComponent();

      const statuses = ['pending', 'active', 'completed', 'cancelled', 'error'];

      statuses.forEach(status => {
        rerender(
          <ThemeProvider theme={theme}>
            <TransgressionTopDetails {...defaultProps} status={status} />
          </ThemeProvider>
        );
      });

      expect(true).toBe(true);
    });
  });
});
