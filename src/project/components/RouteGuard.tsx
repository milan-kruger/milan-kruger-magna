import React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

type Props = {
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state?: any;
    navigate: NavigateFunction;
    defaultUrl: string;
}

class RouteGuard extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    readonly state = this.props.state ?? {};
    readonly url = this.props.defaultUrl;
    readonly navigate = this.props.navigate;

    popstateCb = (event: PopStateEvent) => {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        this.navigate(this.url, { state: this.state });
    }

    componentDidMount(): void {
        window.addEventListener('popstate', this.popstateCb);
    }

    componentWillUnmount(): void {
        window.removeEventListener('popstate', this.popstateCb);
    }

    render() {

        return (
            <>{this.props.children}</>
        )
    }
}

type RouteGuardWrapperProps = {
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state?: any;
    defaultUrl: string;
}

const RouteGuardWrapper = ({ children, defaultUrl, state }: RouteGuardWrapperProps) => {
    const navigate = useNavigate();
    return (
        <RouteGuard state={state} navigate={navigate} defaultUrl={defaultUrl}>{children}</RouteGuard>
    )
}

export default RouteGuardWrapper
