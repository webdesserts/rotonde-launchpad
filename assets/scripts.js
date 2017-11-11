'use strict';

const $ignition = document.querySelector('#ignition')
const $close = document.querySelector('#close')
const $liftoff = document.querySelector('#liftoff')

$ignition.addEventListener('click', ignition)
$close.addEventListener('click', togglePanes)
$liftoff.addEventListener('click', liftoff)

// pre download the ref implementation so its ready when they fork
const ref_archive = new DatArchive("dat://2f21e3c122ef0f2555d3a99497710cd875c7b0383f998a2d37c02c042d598485/")
ref_archive.download()

async function ignition() {
  const $name = document.querySelector('#name')

  togglePanes()
  $name.focus()
}

async function togglePanes () {
  const $paneview = document.querySelector(".pane-view")
  const $panes = document.querySelectorAll(".pane")

  for (const $pane of $panes) {
    $pane.classList.toggle('active')
    let $tabbed_inputs = $pane.querySelectorAll('[tabindex]')
    for (const $input of $tabbed_inputs) {
      if ($input.tabIndex < 0) {
        $input.setAttribute('tabindex', Math.abs($input.tabIndex))
      } else {
        $input.setAttribute('tabindex', -1 * $input.tabIndex)
      }
    }
  }
}

function validateName (name) {
  const $field = document.querySelector('#name').parentNode;
  if (!name) {
    $field.setAttribute('data-invalid', "Name is Required")
    return false
  }

  if (/\s/.test(name)) {
    $field.setAttribute('data-invalid', "A name can't have white space")
    return false
  }
  return true
}

async function liftoff () {

  const $name = document.querySelector('#name')
  const $description = document.querySelector('#description')
  const $website = document.querySelector('#website')

  const name = $name.value.trim();
  const description = $description.value || "";
  const site = $website.value || "";

  if (!validateName(name)) {
    return;
  }
  const launchpad_url = await DatArchive.resolveName(window.location.href)
  const neauoire_url = "dat://2f21e3c122ef0f2555d3a99497710cd875c7b0383f998a2d37c02c042d598485/"

  const launchpad = await new DatArchive(launchpad_url)
  const portal = await DatArchive.fork(neauoire_url, {
    title: `~${name}`,
    description,
  })

  const portal_str = {
    name: name,
    desc: description,
    port: [],
    feed: [],
    site: site,
    dat: portal.url
  }

  await portal.writeFile('/portal.json', JSON.stringify(portal_str));
  let icon = await launchpad.readFile('/assets/icon.svg')
  await portal.writeFile('/media/content/icon.svg', icon);
  await portal.commit();
  open(portal.url)
}
