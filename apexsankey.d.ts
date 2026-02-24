declare module 'apexsankey' {
  interface ApexSankeyOptions {
    width?: number;
    height?: number;
    fontColor?: string;
    nodeWidth?: number;
    enableTooltip?: boolean;
    edgeOpacity?: number;
    canvasStyle?: string;
    enableToolbar?: boolean;
  }
  interface ApexSankeyData {
    nodes: { id: string; title: string }[];
    edges: { source: string; target: string; value: number }[];
  }
  interface ApexSankeyConstructor {
    new (el: HTMLElement, options?: ApexSankeyOptions): { render(data: ApexSankeyData): void };
  }
  const ApexSankey: ApexSankeyConstructor;
  export default ApexSankey;
}
