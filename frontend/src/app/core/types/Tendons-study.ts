export class TendonsStudy {
  constructor(public uuid: string,
              public arrayExpressId: string,
              public pubMedId: string,
              public name: string,
              public description: string,
              public geneExpressionType: string,
              public platform: string,
              public organism: string,
              public cellOrigin: string,
              public year: number,
              public sampleSize: number,
              public visible: boolean) {
  }

  public static createNew() {
    return new TendonsStudy(undefined, '', '', '', '', 'Microarray', '', '', '', new Date().getFullYear(), 0, true);
  }
}
