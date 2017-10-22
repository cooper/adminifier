<script type="text/x-tmpl" id="tmpl-filter-editor">
    <div class="filter-editor-title">Filter</div>
</script>

<script type="text/x-tmpl" id="tmpl-filter-row">
    <span>{%= o.column %}</span>
    <input type="radio" checked /> Contains
    <input type="radio" /> Is<br />
    <input type="text" />
</script>

<script type="text/x-tmpl" id="tmpl-filter-state">
    <span><input type="checkbox" /> {%= o.stateName %}</span>
</script>
