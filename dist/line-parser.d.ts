type Node = {
    text: string;
    markup: Array<{
        name: string;
        properties?: {
            [key: string]: any;
            name?: string;
            trimwhitespace?: boolean;
        };
        position?: number;
        length?: number;
    }>;
};
export default function parseLine(node: Node, locale: string): void;
export {};
