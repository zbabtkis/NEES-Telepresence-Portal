<script data-main="<?php print $module_path; ?>/js/app" src="<?php print $module_path; ?>/js/vendor/Require/require.js"></script>
<div id="TPS-Viewer">
	<aside id='tps-viewer-menu'>
		<nav id='tps-tabs'>
			<i id='help-tab' class='icon icon-info-sign icon-2x' alt='Show Help' title='Show Help'></i>
			<i id='list-tab' class='icon icon-list icon-2x' alt='Show Sites List' title='Show Sites List'></i>
		</nav>
		<header id='menu-header'>
			<h4></h4>
		</header>
		<section id='telepresence-dashboard'>
		</section>
	</aside>
	<div id="content-wrapper">
		<div id="nvf-frame">
			<div id='slider-pan'></div>
			
			<div id="stream"></div>

			<div id='slider-tilt'></div>

			<div id="player-controls">
				<div class="transparentBar"></div>
			</div>
		</div>
	</div>
</div>