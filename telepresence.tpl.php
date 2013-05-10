<script data-main="<?php print $module_path; ?>/js/main" src="<?php print $module_path; ?>/js/libs/require.js"></script>
<div id="TPS-Viewer">
	<aside id='tps-viewer-menu'>
		<nav id='tps-tabs'>
			<button id='help-tab' class='camera-action' alt='Show Help' title='Show Help'></button>
			<button id='list-tab' class='camera-action' alt='Show Sites List' title='Show Sites List'></button>
		</nav>
		<header id='menu-header'>
			<h4></h4>
		</header>
		<section id='telepresence-dashboard'>
		</section>
	</aside>
	<div id="content-wrapper">
		<div id="nvf-frame">
			<div id="stream">
			</div>
			<div id="player-controls">
				<div class="transparentBar"></div>
				<div id='slider'></div>
			</div>
		</div>
	</div>
</div>