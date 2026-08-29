export function goBackOrNavigate(navigation, fallbackRoute) {
  if (!navigation) return;

  if (typeof navigation.goBack === 'function' && navigation.canGoBack && navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  if (typeof navigation.navigate === 'function') {
    navigation.navigate(fallbackRoute);
    return;
  }

  if (typeof navigation.replace === 'function') {
    navigation.replace(fallbackRoute);
  }
}
