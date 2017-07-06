import { NgMapsPage } from './app.po';

describe('ng-maps App', () => {
  let page: NgMapsPage;

  beforeEach(() => {
    page = new NgMapsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
