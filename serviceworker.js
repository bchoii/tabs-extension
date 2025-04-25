try {
  // console.log("My Utils");

  // (async () =>
  //   console.log(
  //     "chrome.commands.getAll",
  //     JSON.stringify(await chrome.commands.getAll(), null, 2)
  //   ))();

  // Tabs

  const closeTab = (tab) => tab && chrome.tabs.remove(tab.id);

  chrome.tabs.onCreated.addListener(async (newTab) => {
    console.log("newTab", newTab);
    chrome.tabs.move(newTab.id, { index: -1 });
  });

  const moveTabToEnd = async (currentTab) => {
    if (!currentTab) return;
    const currentIndex = currentTab.index;
    const tabs = await chrome.tabs.query({ currentWindow: true });
    console.log("tabs", tabs);
    chrome.tabs.move(currentTab.id, { index: -1 });
    try {
      chrome.tabs.update(tabs[currentIndex + 1].id, { active: true });
    } catch (error) {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
  };

  const getCurrentTab = async () => {
    const activeTabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("activeTabs", activeTabs);
    return activeTabs[0];
  };

  chrome.commands.onCommand.addListener(async (command) => {
    // console.log("chrome.commands.onCommand", command);
    const currentTab = await getCurrentTab();
    // console.log({ currentTab });
    switch (command) {
      // case 'close-tab':
      //   await closeTab(currentTab);
      //   break;
      case "move-tab-to-end":
        await moveTabToEnd(currentTab);
        break;
      default:
        break;
    }
  });

  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: "Toggle Frame", title: "Toggle Frame" });
    // chrome.contextMenus.create({ id: "Go Incognito", title: "Go Incognito" });
    // chrome.contextMenus.create({ id: "Open Panel", title: "Open Panel" });
    // chrome.contextMenus.create({ id: "Open Normal", title: "Open Normal" });
    // chrome.contextMenus.create({ id: "Open Popup", title: "Open Popup" });
  });

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    ({
      // "Go Incognito": () =>
      //   chrome.windows.create({
      //     url: info.pageUrl,
      //     state: "maximized",
      //     incognito: true,
      //   }),
      "Toggle Frame": async () => {
        const current = await chrome.windows.getCurrent();
        console.log(current);
        console.log(current.type == "normal");
        switch (current.type) {
          case "normal":
            chrome.windows.create({
              url: info.pageUrl,
              type: "popup",
            });
            break;
          case "popup":
            chrome.windows.create({
              url: info.pageUrl,
              type: "normal",
            });
            break;
          default:
            break;
        }
      },
      "Open Panel": () => {
        chrome.windows.create({
          url: info.pageUrl,
          type: "panel",
        });
      },
      "Open Normal": () => {
        chrome.windows.create({
          url: info.pageUrl,
          type: "normal",
        });
      },
      "Open Popup": () => {
        chrome.windows.create({
          url: info.pageUrl,
          type: "popup",
        });
      },
      // Clone: () => chrome.tabs.create({ url: info.pageUrl }),
    })[info.menuItemId]();
  });
} catch (error) {
  console.error(error);
}
