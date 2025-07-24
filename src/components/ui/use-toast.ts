import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

type CustomToastAction = {
    label: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type ToastProps = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: CustomToastAction;
    icon?: React.ReactNode;
    duration?: number;
};

type ToastReturn = {
    id: string | number;
    dismiss: () => void;
    update: (props: ToastProps) => void;
};

function toast(props: ToastProps): ToastReturn {
    const { title, ...rest } = props;

    const toastId = sonnerToast(title, {
        ...rest,
    });

    const update = (newProps: ToastProps) => {
        sonnerToast(newProps.title, {
            id: toastId,
            ...newProps,
        });
    };

    const dismiss = () => {
        sonnerToast.dismiss(toastId);
    };

    return {
        id: toastId,
        dismiss,
        update,
    };
}

toast.success = (title: React.ReactNode, props?: Omit<ToastProps, 'title'>): ToastReturn => {
    const toastId = sonnerToast.success(title, props);
    return {
        id: toastId,
        dismiss: () => sonnerToast.dismiss(toastId),
        update: (newProps: ToastProps) => sonnerToast(newProps.title, { id: toastId, ...newProps }),
    };
};

toast.error = (title: React.ReactNode, props?: Omit<ToastProps, 'title'>): ToastReturn => {
    const toastId = sonnerToast.error(title, props);
    return {
        id: toastId,
        dismiss: () => sonnerToast.dismiss(toastId),
        update: (newProps: ToastProps) => sonnerToast(newProps.title, { id: toastId, ...newProps }),
    };
};

function useToast() {
    return {
        toast,
        dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    };
}

export { toast, useToast };
