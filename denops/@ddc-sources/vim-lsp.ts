import {
  BaseSource,
  DdcGatherItems,
  Item as DdcItem,
} from "https://deno.land/x/ddc_vim@v3.2.0/types.ts#^";

import {
  GatherArguments,
} from "https://deno.land/x/ddc_vim@v3.2.0/base/source.ts#^";

// deno-lint-ignore ban-types
type Params = {
  ignoreCompleteProvider: boolean;
};

export class Source extends BaseSource<Params> {
  private counter = 0;
  override async gather(
    args: GatherArguments<Params>,
  ): Promise<DdcGatherItems> {
    this.counter = (this.counter + 1) % 100;

    const lspservers: string[] = await args.denops.call(
      "ddc_vim_lsp#get_completion_servers",
      args.sourceParams.ignoreCompleteProvider,
      // deno-lint-ignore no-explicit-any
    ) as any;
    if (lspservers.length === 0) {
      return [];
    }

    const id = `source/${this.name}/${this.counter}`;

    const [payload] = await Promise.all([
      args.onCallback(id) as Promise<{
        items: DdcItem[];
        isIncomplete: boolean;
      }>,
      args.denops.call("ddc_vim_lsp#request", lspservers[0], id),
    ]);
    return { items: payload.items, isIncomplete: payload.isIncomplete };
  }

  override params(): Params {
    return {
      ignoreCompleteProvider: false,
    };
  }
}
