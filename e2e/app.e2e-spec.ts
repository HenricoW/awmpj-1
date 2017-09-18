import { NuvestPage } from './app.po';

describe('nuvest App', function() {
  let page: NuvestPage;

  beforeEach(() => {
    page = new NuvestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
