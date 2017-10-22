<script type="text/x-tmpl" id="tmpl-filter-editor">
    <div class="filter-editor-title">Filter</div>
</script>

<script type="text/x-tmpl" id="tmpl-filter-text">
    <span><input type="checkbox" /> {%= o.column %}</span>
    <div class="filter-row-inner">
        <input type="radio" checked /> Contains
        <input type="radio" /> Is<br />
        <i class="fa fa-plus-circle fa-lg" style="color: chartreuse;"></i>
        <input type="text" />
    </div>
</script>

<script type="text/x-tmpl" id="tmpl-filter-state">
    <span><input type="checkbox" /> {%= o.stateName %}</span>
</script>

<script type="text/x-tmpl" id="tmpl-filter-item">
    <i class="fa fa-minus-circle fa-lg" style="color: #FF7070;"></i>
    {%= o.item %}
</script>
